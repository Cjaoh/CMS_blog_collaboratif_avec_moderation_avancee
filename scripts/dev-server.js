#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const PortManager = require('./port-manager');

class DevServer {
  constructor() {
    this.processes = [];
    this.isShuttingDown = false;
    this.backendReady = false;
    this.setupGracefulShutdown();
  }

  setupGracefulShutdown() {
    const shutdown = (signal) => {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;
      
      console.log(`\n🛑 Réception du signal ${signal}, arrêt propre...`);
      
      this.processes.forEach(proc => {
        if (proc && !proc.killed) {
          console.log(`🔄 Arrêt du processus ${proc.name} (PID: ${proc.pid})`);
          proc.kill('SIGTERM');
        }
      });

      // Forcer l'arrêt après 10 secondes
      setTimeout(() => {
        this.processes.forEach(proc => {
          if (proc && !proc.killed) {
            console.log(`⚡ Forçage de l'arrêt du processus ${proc.name}`);
            proc.kill('SIGKILL');
          }
        });
        process.exit(0);
      }, 10000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGHUP', () => shutdown('SIGHUP'));
  }

  async start() {
    try {
      console.log('🚀 Démarrage du serveur de développement...\n');

      // 1. Préparer les ports
      const portManager = new PortManager();
      const ports = await portManager.preparePorts();
      portManager.updateEnvFiles(ports.backend, ports.frontend);

      // 2. Démarrer le backend
      console.log('📦 Démarrage du backend NestJS...');
      const backendProcess = spawn('npm', ['run', 'start:dev'], {
        cwd: path.join(__dirname, '../backend'),
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      backendProcess.name = 'backend';
      backendProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
          console.log(`🔧 [Backend] ${output}`);
          
          // Détecter que le backend est prêt
          if (output.includes('Nest application successfully started')) {
            this.backendReady = true;
          }
        }
      });

      backendProcess.stderr.on('data', (data) => {
        const output = data.toString().trim();
        if (output && !output.includes('[Nest]') && !output.includes('LOG')) {
          console.log(`❌ [Backend Error] ${output}`);
        }
      });

      backendProcess.on('error', (error) => {
        console.error(`💥 Erreur backend: ${error.message}`);
      });

      backendProcess.on('close', (code) => {
        console.log(`🔚 Backend terminé avec le code ${code}`);
      });

      this.processes.push(backendProcess);

      // 3. Attendre que le backend soit prêt
      await this.waitForBackendReady();

      // 4. Démarrer le frontend
      console.log('\n? Démarrage du frontend Angular...');
      const frontendProcess = spawn('npx', ['ng', 'serve', '--port', ports.frontend.toString()], {
        cwd: path.join(__dirname, '../frontend'),
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      frontendProcess.name = 'frontend';
      frontendProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
          // Filtrer les logs Angular non essentiels
          if (!output.includes('watch') && !output.includes('live reload')) {
            console.log(`🎨 [Frontend] ${output}`);
          }
        }
      });

      frontendProcess.stderr.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
          console.log(`⚠️ [Frontend Warning] ${output}`);
        }
      });

      frontendProcess.on('error', (error) => {
        console.error(`💥 Erreur frontend: ${error.message}`);
      });

      frontendProcess.on('close', (code) => {
        console.log(`🔚 Frontend terminé avec le code ${code}`);
      });

      this.processes.push(frontendProcess);

      // 5. Afficher les informations d'accès
      setTimeout(() => {
        console.log('\n' + '='.repeat(60));
        console.log('🎉 SERVEURS DÉMARRÉS AVEC SUCCÈS');
        console.log('='.repeat(60));
        console.log(`🔧 Backend API:  http://localhost:${ports.backend}/api`);
        console.log(`🎨 Frontend:    http://localhost:${ports.frontend}`);
        console.log(`📚 Docs API:    http://localhost:${ports.backend}/api/docs`);
        console.log('='.repeat(60));
        console.log('💡 Appuyez sur Ctrl+C pour arrêter proprement');
        console.log('='.repeat(60) + '\n');
      }, 5000);

    } catch (error) {
      console.error('❌ Erreur au démarrage:', error.message);
      process.exit(1);
    }
  }

  async waitForBackendReady(timeout = 60000) {
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (this.backendReady) {
          clearInterval(checkInterval);
          console.log('✅ Backend NestJS prêt !');
          resolve();
        }
        
        if (Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          reject(new Error(`Timeout d'attente du backend (${timeout}ms)`));
        }
      }, 1000);
    });
  }
}

// Démarrage
if (require.main === module) {
  const devServer = new DevServer();
  devServer.start().catch(error => {
    console.error('💥 Erreur fatale:', error.message);
    process.exit(1);
  });
}

module.exports = DevServer;
