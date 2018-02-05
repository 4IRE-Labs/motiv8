module.exports = {
  networks: {
      development: {
          host: "localhost",
          port: 9545,
          network_id: "*" // Match any network id
      },
      rinkeby: {
          host: "localhost",
          port: 8545,
          network_id: "4", // Rinkeby ID 4
          from: "0x99a4572656eb49FFEEFbe9588f8e7ab0F8D6Eb5e", // account from which to deploy
          gas: 6712390
      }
  }
};
