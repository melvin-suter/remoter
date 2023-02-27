export const environment = {
  production: true,
  apiUrl: (window as { [key: string]: any })["env"]["apiUrl"] || '/api'
};
