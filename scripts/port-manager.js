#!/usr/bin/env node

const { execSync } = require('child_process');
const net = require('net');
const fs = require('fs');
const path = require('path');

class PortManager {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    const envPath = path.join(__dirname, '../.env');
    const config = {};
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          config[key.trim()] = value.trim();
        }
      });
    }

    return {
      backend: {
        port: parseInt(config.PORT) || 3001,
        fallback: [3002, 3003, 3004, 3005]
      },
      frontend: {
        port: parseInt(config.FRONTEND_PORT) || 4200,
        fallback: [4201, 4202, 4203, 4204]
      }
    };
  }

  checkPort(port) {
    return new Promise((resolve) => {
      const server = net.createServer();
      
      server.listen(port, () => {
        server.once('close', () => {
          resolve(true);
        });
        server.close();
      });
      
      server.on('error', () => {
        resolve(false);
      });
    });
  }

  async findAvailablePort(basePort, fallbackPorts = []) {
    const portsToCheck = [basePort, ...fallbackPorts];
    
    for (const port of portsToCheck) {
      const isAvailable = await this.checkPort(port);
      if (isAvailable) {
        return port;
      }
    }
    
    throw new Error(`Aucun port disponible dans la liste: ${portsToCheck.join(', ')}`);
  }

  killProcessOnPort(port) {
    try {
      // Linux/Ubuntu: trouver et tuer les processus sur le port
      const result = execSync(
        `lsof -ti:${port} | xargs -r kill -TERM 2>/dev/null || true`,
        { encoding: 'utf8', stdio: 'pipe' }
      );
      
      // Attendre un peu pour la libération propre
      setTimeout(() => {
        // Forcer si nécessaire (dernier recours)
        execSync(
          `lsof -ti:${port} | xargs -r kill -KILL 2>/dev/null || true`,
          { encoding: 'utf8', stdio: 'pipe' }
        );
      }, 2000);
      
      return true;
    } catch (error) {
      return false;
    }
  }

  async preparePorts() {
    console.log('🔍 Vérification des ports...');
    
    const backendPort = await this.findAvailablePort(
      this.config.backend.port,
      this.config.backend.fallback
    );
    
    const frontendPort = await this.findAvailablePort(
      this.config.frontend.port,
      this.config.frontend.fallback
    );
    
    // Libérer les ports si nécessaire
    this.killProcessOnPort(this.config.backend.port);
    this.killProcessOnPort(this.config.frontend.port);
    
    // Attendre la libération
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const finalBackendPort = await this.findAvailablePort(
      this.config.backend.port,
      this.config.backend.fallback
    );
    
    const finalFrontendPort = await this.findAvailablePort(
      this.config.frontend.port,
      this.config.frontend.fallback
    );
    
    console.log(`✅ Ports disponibles: Backend=${finalBackendPort}, Frontend=${finalFrontendPort}`);
    
    return {
      backend: finalBackendPort,
      frontend: finalFrontendPort
    };
  }

  updateEnvFiles(backendPort, frontendPort) {
    // Mettre à jour .env backend
    const backendEnvPath = path.join(__dirname, '../backend/.env');
    if (fs.existsSync(backendEnvPath)) {
      let content = fs.readFileSync(backendEnvPath, 'utf8');
      content = content.replace(/^PORT=.*/m, `PORT=${backendPort}`);
      fs.writeFileSync(backendEnvPath, content);
    }

    // Mettre à jour .env frontend
    const frontendEnvPath = path.join(__dirname, '../frontend/.env');
    let frontendContent = '';
    
    if (fs.existsSync(frontendEnvPath)) {
      frontendContent = fs.readFileSync(frontendEnvPath, 'utf8');
    } else {
      frontendContent = 'PORT=4200\n';
    }
    
    frontendContent = frontendContent.replace(/^PORT=.*/m, `PORT=${frontendPort}`);
    fs.writeFileSync(frontendEnvPath, frontendContent);

    // Mettre à jour environment.ts Angular
    const angularEnvPath = path.join(__dirname, '../frontend/src/environments/environment.ts');
    if (fs.existsSync(angularEnvPath)) {
      let angularContent = fs.readFileSync(angularEnvPath, 'utf8');
      const apiUrlMatch = angularContent.match(/apiUrl:\s*['"]([^'"]+)['"]/);
      if (apiUrlMatch) {
        const currentUrl = apiUrlMatch[1];
        const newUrl = currentUrl.replace(/:\d+/, `:${backendPort}`);
        angularContent = angularContent.replace(/apiUrl:\s*['"][^'"]+['"]/m, `apiUrl: '${newUrl}'`);
        fs.writeFileSync(angularEnvPath, angularContent);
      }
    }
  }
}

module.exports = PortManager;

// Si exécuté directement
if (require.main === module) {
  const portManager = new PortManager();
  portManager.preparePorts()
    .then(ports => {
      portManager.updateEnvFiles(ports.backend, ports.frontend);
      console.log('🎯 Configuration des ports terminée');
    })
    .catch(error => {
      console.error('❌ Erreur:', error.message);
      process.exit(1);
    });
}
