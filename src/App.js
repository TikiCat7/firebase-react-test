import React, { Component } from 'react';
import './App.css';
import * as firebase from 'firebase';
import playData from './playData'

class App extends Component {

  constructor() {
    super();
    this.state = {
      posts: '',
      postVal: '',
      postName: '',
      email: '',
      password: '',
      uid: '',
      plays: playData
    }

    let config = {
      apiKey: "AIzaSyAxyPM42OKhbH-wFPdbQcD6Rt2PeKtvjpQ",
      authDomain: "react-1119e.firebaseapp.com",
      databaseURL: "https://react-1119e.firebaseio.com",
      storageBucket: "react-1119e.appspot.com",
      messagingSenderId: "263852110059"
    };
    this.firebase = firebase.initializeApp(config)

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handlePostNameChange = this.handlePostNameChange.bind(this)
    this.handleDeletePost = this.handleDeletePost.bind(this)
    this.handleEmailChange = this.handleEmailChange.bind(this)
    this.handlePasswordChange = this.handlePasswordChange.bind(this)
    this.gitHubLogIn = this.gitHubLogIn.bind(this)
    this.logIn = this.logIn.bind(this)
    this.signOut = this.signOut.bind(this)
    this.userWriteTest = this.userWriteTest.bind(this)
  }

  handlePasswordChange(e) {
    this.setState({
      password: e.target.value
    })
  }

  handleEmailChange(e) {
    this.setState({
      email:e.target.value
    })
  }

  signOut(e) {
    e.preventDefault()
    this.firebase.auth().signOut().then(()=> console.log('signed out successfully'))
  }

  logIn(e) {
    e.preventDefault()
    this.firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
    .then(() => console.log('success'))
    .catch(error => console.log(error))
  }

  handleSubmit(e) {
    e.preventDefault()
    const db = this.firebase.database().ref()
    let newPostKey = db.child('posts').push().key; // get a key using .push().key
    let updates = {}
    let post = {
      content: this.state.postVal,
      name: this.state.postName
    }
    updates['/posts/' + newPostKey] = post;
    db.update(updates).then(()=> {
      this.setState({
        postVal: '',
        postName: ''
      })
    }); // use .update() with object containing key value pair to be pushed
  }

  userWriteTest() {
    console.log(this.firebase.auth().currentUser.uid)
    this.firebase.database().ref().child('users/'+this.firebase.auth().currentUser.uid).push({'foo':'bar'})
    .then(()=>console.log('write success'))
    .catch(error => console.log(error))
  }

  handleDeletePost(id) {
    console.log('delete post called for postID: '+id)
    this.firebase.database().ref().child('posts').child(id).remove()
    .then(()=> console.log('delete success'))
    .catch(error => console.log(error))
  }

  handleChange(e) {
    this.setState({
      postVal: e.target.value
    })
  }

  handlePostNameChange(e) {
    this.setState({
      postName: e.target.value
    })
  }

  componentDidMount() {
    const db = this.firebase.database().ref().child('posts')
    // console.log(db)
    db.on('value', data => {
      // console.log(data.val())
      this.setState({
        posts: data.val()
      })
    })
    // this.state.plays.forEach(play => {
    //
    // })
    // db.child('plays').update(this.state.plays)
    this.firebase.auth().onAuthStateChanged(user => {
      if (user) {
        console.log(`logged in`)
        console.log(user.providerData)
        console.log(user.uid)
        this.setState({
          uid:user.providerData[0].uid
        })
        console.log(`Email Verification: ${user.emailVerified}`)
        if(user.emailVerified !== true) {
          console.log('gotta verify email')
          user.sendEmailVerification().then(()=> console.log('verification email sent'))
        }
      } else {
        console.log('not logged in')
      }
    });
  }

  gitHubLogIn(e) {
    e.preventDefault()
        // Using a redirect.
    this.firebase.auth().getRedirectResult().then(function(result) {
      if (result.credential) {
        // This gives you a GitHub Access Token.
        // var token = result.credential.accessToken;
      }
      var user = result.user;
      console.log(user)
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      // var errorMessage = error.message;
      // The email of the user's account used.
      // var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      // var credential = error.credential;
      if (errorCode === 'auth/account-exists-with-different-credential') {
        alert('You have signed up with a different provider for that email.');
        // Handle linking here if your app allows it.
      } else {
        console.error(error);
      }
    });

    // Start a sign in process for an unauthenticated user.
    var provider = new firebase.auth.GithubAuthProvider();
    provider.addScope('repo');
    firebase.auth().signInWithRedirect(provider).then(()=>console.log('signed in with Github'));
  }

  render() {
    // console.log(this.state.posts)
    const posts = []
    for(let post in this.state.posts) {
      if(this.state.posts.hasOwnProperty(post)) {
        let obj = {
          id:post,
          postObj:this.state.posts[post]
        }
        posts.push(obj)
      }
    }
    // console.log(posts)
    let mappedPosts = posts.map(post => {
      return (
        <div key={post.id} className="List-item">
          <span>
            Name: {post.postObj.name}, Content: {post.postObj.content}
          </span>
          <button onClick={()=>this.handleDeletePost(post.id)}>Delete</button>
        </div>
      )
    })
    return (
      <div className="App">
        <h1>NBA React Firebase Starter</h1>
        <form onSubmit={this.handleSubmit}>
          <label> Post:
            <input onChange={this.handleChange} value={this.state.postVal} />
          </label>
          <div>
          <label> Name:
            <input onChange={this.handlePostNameChange} value={this.state.postName} />
          </label>
        </div>
          <input type="submit" value="Submit" />
        </form>
        <div className="Posts">
          {mappedPosts}
        </div>
        <div className="Login">
          <form onSubmit={this.logIn} className="LoginElement">
            <div>
            <label>
              Email:
              <input onChange={this.handleEmailChange} value={this.state.email} />
            </label>
            </div>
            <div>
            <label>
              Password:
              <input type="Password" onChange={this.handlePasswordChange} value={this.state.password} />
            </label>
            </div>
            <div>
              <input type="submit" value="Create Account" />
            </div>
          </form>
        </div>
        <button onClick={this.gitHubLogIn}>Github Login</button>
        <button onClick={this.signOut}>Sign Out</button>
        <button onClick={this.userWriteTest}>Post Data (Auth required)</button>
      </div>
    )
  }
}

export default App;
