interface Config {
  vaultPath: string;
  // 可以在这里添加其他配置项
}

const config: Config = {
  vaultPath: import.meta.env.VITE_VAULT_PATH || '/vault', // 默认值
};

export default config;
