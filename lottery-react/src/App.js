import React from "react";
import "./App.css";
import lottery from "./lottery";
import web3 from "./web3";

class App extends React.Component {
  state = {
    manager: "",
    players: [],
    balance: "",
    value: "",
    message: "",
    lastWinner: "",
    buttonSubmit: false,
    buttonPick: false,
    isManager: false,
  };
  async componentDidMount() {
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);
    const currentUser = await web3.eth.getAccounts();
    const isManager = currentUser[0] === manager;
    this.setState({ manager, players, balance, isManager });
  }
  onSubmit = async (event) => {
    event.preventDefault();
    this.setState({ buttonSubmit: true });

    const accounts = await web3.eth.getAccounts();

    this.setState({ message: "Waiting on transaction success..." });

    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(this.state.value, "ether"),
    });
    this.setState({ value: "" });
    this.setState({ buttonSubmit: false });
    this.setState({ message: "You have been entered!" });
    this.componentDidMount();
  };

  onClick = async () => {
    this.setState({ buttonPick: true });
    const accounts = await web3.eth.getAccounts();
    this.setState({ message: "Waiting on transaction success..." });
    await lottery.methods.pickWinner().send({ from: accounts[0] });
    this.setState({ message: "A winner has been picked!" });
    const lastWinner = await lottery.methods.lastWinner().call();
    this.setState({ lastWinner });
    this.setState({ buttonPick: false });
    this.componentDidMount();
  };
  render() {
    let isManager = this.state.isManager;
    // web3.eth.getAccounts().then(console.log);
    // console.log(web3.version);
    return (
      <div>
        <h2>Lottery Contract</h2>
        <p>
          This contract is managed by {this.state.manager} <br />
          There are currently {this.state.players.length} people entered, <br />
          competing to win {web3.utils.fromWei(
            this.state.balance,
            "ether"
          )}{" "}
          ether!
        </p>
        <hr />

        <form onSubmit={this.onSubmit}>
          <h4>Want to try your luck?</h4>
          <div>
            <label>Amount of ether to enter</label>
            <input
              value={this.state.value}
              onChange={(event) => this.setState({ value: event.target.value })}
            />
          </div>
          <button disabled={this.state.buttonSubmit}>Enter</button>
        </form>
        {isManager ? (
          <div>
            <hr />
            <h4>Ready to pick a winner?</h4>
            <button disabled={this.state.buttonPick} onClick={this.onClick}>
              Pick a winner!
            </button>
          </div>
        ) : (
          ""
        )}
        <hr />
        <h1>{this.state.message}</h1>
        <h3>{this.state.lastWinner}</h3>
      </div>
    );
  }
}

export default App;
