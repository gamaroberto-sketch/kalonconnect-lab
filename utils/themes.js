// themes.js - Sistema de Temas do Kalon OS

export const themes = {
  verde: {
    name: 'Verde',
    primary: '#093b3e',
    secondary: '#c5c6b7',
    primaryLight: '#0d4a4e',
    primaryDark: '#062a2c',
    secondaryLight: '#d4d5c8',
    secondaryDark: '#a8a9a0',
    textPrimary: '#093b3e',
    textSecondary: '#4a5a5b',
    background: '#ffffff',
    backgroundSecondary: '#f8f9fa',
    border: '#c5c6b7',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
    info: '#17a2b8'
  },
  
  azul: {
    name: 'Azul',
    primary: '#112b43',
    secondary: '#afc8db',
    primaryLight: '#1a3d5a',
    primaryDark: '#0c1f2e',
    secondaryLight: '#c1d4e3',
    secondaryDark: '#8fa8b8',
    textPrimary: '#112b43',
    textSecondary: '#4a5a5b',
    background: '#ffffff',
    backgroundSecondary: '#f8f9fa',
    border: '#afc8db',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
    info: '#17a2b8'
  },
  
  caramelo: {
    name: 'Caramelo',
    primary: '#cb8c64',
    secondary: '#ead1b9',
    primaryLight: '#d49a7a',
    primaryDark: '#b07a4e',
    secondaryLight: '#f0ddd0',
    secondaryDark: '#d4b8a2',
    textPrimary: '#8b4513',
    textSecondary: '#6b4e3d',
    background: '#ffffff',
    backgroundSecondary: '#faf8f6',
    border: '#ead1b9',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
    info: '#17a2b8'
  }
};

export const getThemeCSS = (theme) => {
  const t = themes[theme];
  return `
    :root {
      --color-primary: ${t.primary};
      --color-secondary: ${t.secondary};
      --color-primary-light: ${t.primaryLight};
      --color-primary-dark: ${t.primaryDark};
      --color-secondary-light: ${t.secondaryLight};
      --color-secondary-dark: ${t.secondaryDark};
      --color-text-primary: ${t.textPrimary};
      --color-text-secondary: ${t.textSecondary};
      --color-background: ${t.background};
      --color-background-secondary: ${t.backgroundSecondary};
      --color-background-dark: #1f2937;
      --color-text-light: #f9fafb;
      --color-border: ${t.border};
      --color-success: ${t.success};
      --color-warning: ${t.warning};
      --color-error: ${t.error};
      --color-info: ${t.info};
    }
    
    html {
      background-color: var(--color-background) !important;
    }
    
    body {
      font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
      color: var(--color-text-primary) !important;
      background-color: var(--color-background) !important;
    }
    
    h1, h2, h3, h4, h5, h6, .logo, .main-menu {
      font-family: 'Inter', 'Atsanee', sans-serif;
      font-weight: 400;
    }
    
    .theme-primary {
      background-color: var(--color-primary);
      color: white;
    }
    
    .theme-primary-light {
      background-color: var(--color-primary-light);
      color: white;
    }
    
    .theme-secondary {
      background-color: var(--color-secondary);
      color: var(--color-text-primary);
    }
    
    .theme-secondary-light {
      background-color: var(--color-secondary-light);
      color: var(--color-text-primary);
    }
    
    .theme-text-primary {
      color: var(--color-text-primary);
    }
    
    .theme-text-secondary {
      color: var(--color-text-secondary);
    }
    
    .theme-border {
      border-color: var(--color-border);
    }
    
    .theme-bg-primary {
      background-color: var(--color-primary);
    }
    
    .theme-bg-secondary {
      background-color: var(--color-secondary);
    }
    
    .theme-bg-light {
      background-color: var(--color-background-secondary);
    }
  `;
};

export const applyTheme = (themeName) => {
  const themeCSS = getThemeCSS(themeName);
  
  // Remove tema anterior
  const existingStyle = document.getElementById('theme-styles');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Aplica novo tema
  const style = document.createElement('style');
  style.id = 'theme-styles';
  style.textContent = themeCSS;
  document.head.appendChild(style);
  
  // Salva no localStorage
  localStorage.setItem('kalon-theme', themeName);
  
  // Adiciona classe ao body para referência
  document.body.className = document.body.className.replace(/theme-\w+/g, '');
  document.body.classList.add(`theme-${themeName}`);
};

export const getCurrentTheme = () => {
  return localStorage.getItem('kalon-theme') || 'verde';
};

export const initializeTheme = () => {
  const currentTheme = getCurrentTheme();
  applyTheme(currentTheme);
  return currentTheme;
};


