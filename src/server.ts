export async function startServer(): Promise<void> {
  console.log('Server started');
}

if (require.main === module) {
  startServer();
}
