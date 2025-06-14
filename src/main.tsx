
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add meta tags for mobile optimization and PWA
const metaViewport = document.createElement('meta');
metaViewport.name = 'viewport';
metaViewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
document.head.appendChild(metaViewport);

const metaDescription = document.createElement('meta');
metaDescription.name = 'description';
metaDescription.content = 'فريق قهار الرياضي - منصة الألعاب الإلكترونية الرائدة في المملكة العربية السعودية';
document.head.appendChild(metaDescription);

const metaKeywords = document.createElement('meta');
metaKeywords.name = 'keywords';
metaKeywords.content = 'قهار, ألعاب إلكترونية, بطولات, فريق, السعودية, esports';
document.head.appendChild(metaKeywords);

const metaRobots = document.createElement('meta');
metaRobots.name = 'robots';
metaRobots.content = 'index, follow';
document.head.appendChild(metaRobots);

// PWA Meta tags
const metaThemeColor = document.createElement('meta');
metaThemeColor.name = 'theme-color';
metaThemeColor.content = '#dc2626';
document.head.appendChild(metaThemeColor);

const metaAppleMobileWebAppCapable = document.createElement('meta');
metaAppleMobileWebAppCapable.name = 'apple-mobile-web-app-capable';
metaAppleMobileWebAppCapable.content = 'yes';
document.head.appendChild(metaAppleMobileWebAppCapable);

const metaAppleMobileWebAppStatusBarStyle = document.createElement('meta');
metaAppleMobileWebAppStatusBarStyle.name = 'apple-mobile-web-app-status-bar-style';
metaAppleMobileWebAppStatusBarStyle.content = 'black-translucent';
document.head.appendChild(metaAppleMobileWebAppStatusBarStyle);

createRoot(document.getElementById("root")!).render(<App />);
