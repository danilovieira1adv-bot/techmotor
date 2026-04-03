// Script simples para build do frontend
import { execSync } from 'child_process';

console.log('Building client...');
try {
  execSync('cd client && npx vite build', { stdio: 'inherit' });
  console.log('✅ Client build completed!');
} catch (error) {
  console.error('❌ Client build failed:', error);
  process.exit(1);
}