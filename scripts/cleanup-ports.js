#!/usr/bin/env node

const { execSync } = require('child_process');

class PortCleaner {
  constructor() {
    this.targetPorts = [3001, 3002, 3003, 3004, 3005, 4200, 4201, 4202, 4203, 4204];
  }

  killProcessesOnPorts() {
    console.log('🧹 Nettoyage des ports...');
    
    this.targetPorts.forEach(port => {
      try {
        const result = execSync(`lsof -ti:${port}`, { encoding: 'utf8', stdio: 'pipe' });
        if (result.trim()) {
          const pids = result.trim().split('\n');
          pids.forEach(pid => {
            try {
              console.log(`🔄 Arrêt du processus ${pid} sur le port ${port}`);
              execSync(`kill -TERM ${pid}`, { stdio: 'pipe' });
            } catch (error) {
              // Le processus est déjà arrêté
            }
          });
        }
      } catch (error) {
        // Pas de processus sur ce port
      }
    });

    // Attendre la libération
    setTimeout(() => {
      this.forceKill();
    }, 2000);
  }

  forceKill() {
    console.log('⚡ Vérification et forçage si nécessaire...');
    
    this.targetPorts.forEach(port => {
      try {
        const result = execSync(`lsof -ti:${port}`, { encoding: 'utf8', stdio: 'pipe' });
        if (result.trim()) {
          const pids = result.trim().split('\n');
          pids.forEach(pid => {
            try {
              console.log(`💥 Forçage de l'arrêt du processus ${pid} sur le port ${port}`);
              execSync(`kill -KILL ${pid}`, { stdio: 'pipe' });
            } catch (error) {
              // Le processus est déjà arrêté
            }
          });
        }
      } catch (error) {
        // Pas de processus sur ce port
      }
    });

    console.log('✅ Nettoyage des ports terminé');
  }
}

if (require.main === module) {
  const cleaner = new PortCleaner();
  cleaner.killProcessesOnPorts();
}

module.exports = PortCleaner;
