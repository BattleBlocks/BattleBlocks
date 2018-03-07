import React from "react";
import Leftboard from "../../components/Leftboard";
import Rightboard from "../../components/Rightboard";
import { Container, Row, Col } from "reactstrap";
import Navbar from "../../components/Nav/index";
import fire from "../../fire.js";
import axios from 'axios';

class Gameboard extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      //Game ID
      gameID : "",

      //Game state settings
      player: null, // from user login!
      opponent: "waiting for player", // from user login!

      headline: "Game is live",
      high_side: null,
      boardleader: "Waiting for player 2...",
      leader: 0,

      //Buttons
      leftButtons : "",
      rightButtons : "",
    }
  }

// ----------------------- ------------- -----------------------//
// --------------------------- SETUP ---------------------------//
// ----------------------- ------------- -----------------------//

  //Captures the gameID from the url
  parseUrl = () => {
    let gameUrl = window.location.href;
    let path = new URL(gameUrl);

    let gameID = path.pathname.slice(11);

    this.setState({
      gameID : gameID
    })
    this.getFirebaseButtons(gameID);
  }

  //Get buttons from firebase
  getFirebaseButtons = (gameID) => {
    console.log("gameboard.getFirebaseButtons =>")

    //Synchronize firebase with state 'buttons'
    fire.syncState("Live_Games/"+gameID+'/headline', {
      context: this,
      state: 'headline'
    })

    //Synchronize firebase with state 'buttons'
    fire.syncState("Live_Games/"+gameID+'/high_side', {
      context: this,
      state: 'high_side'
    })

    //Synchronize firebase with state 'buttons'
    fire.syncState("Live_Games/"+gameID+'/boardleader', {
      context: this,
      state: 'boardleader'
    })

    //Synchronize firebase with state 'leftButtons'
    fire.syncState("Live_Games/"+gameID+'/user1_buttons', {
      context: this,
      state: 'leftButtons'
    })

    //Synchronize firebase with state 'buttons'
    fire.syncState("Live_Games/"+gameID+'/user2_buttons', {
      context: this,
      state: 'rightButtons'
    })

    //Synchronize firebase with player 2
    fire.syncState("Live_Games/"+gameID+'/user2_name', {
      context: this,
      state: 'opponent'
    })

    //Synchronize firebase with player 1
    fire.syncState("Live_Games/"+gameID+'/user1_name', {
      context: this,
      state: 'player'
    })
  }

// ----------------------- ------------- -----------------------//
// ----------------------- Click Actions -----------------------//
// ----------------------- ------------- -----------------------//

  //Checks who is the boardleader
  countBlocks = () => {
    console.log("gameboard.countBlocks =>");

    let u2_blocks = 0;
    let u1_blocks = 0;

    for (let i=0; i<this.state.rightButtons.length; i++){
      if(this.state.rightButtons[i].active === 1){
        u2_blocks = u2_blocks + 1
      }
    }
    this.setState({u2_blockcount : u2_blocks})

    for (let i=0; i<this.state.leftButtons.length; i++){
      if(this.state.leftButtons[i].active === 1){
        u1_blocks = u1_blocks + 1
      }
    }
    this.setState({u1_blockcount : u1_blocks})

    if (u1_blocks === 0) {
      this.endGame(this.state.player)
      this.setState({leftButtons : "", rightButtons : ""})

    } else if (u2_blocks === 0) {
      this.endGame(this.state.opponent)
      this.setState({leftButtons : "", rightButtons : ""})

    } else {
      this.updateLeader(u1_blocks, u2_blocks)
    }
  }

  //Updates the boardleader based on countBlocks()
  updateLeader = (u1_blocks, u2_blocks) => {
    let leader = "Neither"

    if (u1_blocks === u2_blocks) {
      this.setState({boardleader: "Both players are equal"});
    }  else
    if (u1_blocks < u2_blocks) {
      leader = this.state.opponent;
    } else {
      leader = this.state.player;
    }
    this.setState({
      high_side: leader,
      boardleader: leader+" has the most blocks!"})
  }

  endFirebase = () => {
    console.log("gameboard.endFirebase =>")

    fire.remove("Live_Games/"+this.state.gameID, function(err) {
      if(err) {
        console.log("Error deleting firebase end-point")
      }
    })
  }


  componentWillUnmount() {
    this.endFirebase();
  }


  endGame = winner => {
    console.log("Winner function triggered")
    let name = winner;
    this.setState({
      high_side: "",
      headline: "The game is over",
      boardleader: "The winner is: "+name
    })
  };

// ----------------------- ------------- -----------------------//
// -------------------- Component Lifecycle --------------------//
// ----------------------- ------------- -----------------------//

  //Get button object from firebase
  componentWillMount() {
    console.log("gameboard.WillMount =>")
    this.parseUrl();
  }

// ----------------------- ------------- -----------------------//
// ----------------------- Render Logic ------------------------//
// ----------------------- ------------- -----------------------//

  render() {
    console.log("gameboard.render =>")
    console.log(this.state.player)
    console.log(this.state.opponent)
    console.log(this.countBlocks)
    console.log(this.state.high_side)
    console.log(this.endGame)
    return (
      <Container fluid>
      <Navbar
        headline = {this.state.headline}
        href = {"/lobby"}
        navAction = {"Lobby"}
      />
        <Row>
          <h2>{this.state.boardleader}</h2>
        </Row>
        <Row>
          <Col>
            <Leftboard
              player = {this.state.player}
              opponent = {this.state.opponent}
              countBlocks = {this.countBlocks}
              high = {this.state.high_side}
              winner = {this.endGame}
            />
          </Col>
          <Col>
            <Rightboard
              player = {this.state.opponent}
              opponent = {this.state.player}
              countBlocks = {this.countBlocks}
              high = {this.state.high_side}
              winner = {this.endGame}
            />
          </Col>
        </Row>
      </Container>
    )
  }
}

export default Gameboard;