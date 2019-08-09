import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import axios from 'axios';

// import socket from '../socket'; //=======================================================
import io from 'socket.io-client';

class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      usernameError: false,
      usernameErrorMessage: '',
      passwordError: false,
      passwordErrorMessage: ''
      // socket: socket() //=======================================================
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleGithubLogin = this.handleGithubLogin.bind(this);
  }

  componentDidMount() {
    //=======================================================
    if (!this.state.socket) {
      this.setState(
        {
          socket: io()
        },
        () => {
          this.state.socket.on('github login', user => {
            if (user.user) {
              this.state.socket.emit('close');
              this.props.updateUserAndOpenSocket(user.user);
            }
          }); // ========================================
        }
      );
    }
  }

  componentDidUpdate() {
    if (this.state.socket) {
      this.state.socket.off('github login'); // ========================================
      this.state.socket.on('github login', user => {
        if (user.user) {
          this.state.socket.emit('close');
          this.props.updateUserAndOpenSocket(user.user);
        }
        this.props.history.push('/');
      }); // ========================================
    }
  }

  componentWillUnmount() {
    if (this.state.socket) {
      this.state.socket.emit('close');
    }
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  async handleSubmit(event) {
    const loginType = event.target.name;
    console.log(loginType);
    event.preventDefault();
    await this.setState({ usernameError: false, passwordError: false });

    // if (loginType === 'githubLogin') {
    //   axios
    //     .get('/githubLogin')
    //     .then(res => console.log(res))
    //     .catch(error => console.log(error));
    // } else {
    let loginError = 0;
    if (!this.state.username.trim()) {
      this.setState({ usernameError: true, usernameErrorMessage: 'Enter a valid username' });
      loginError = 1;
    }
    if (!this.state.password.trim()) {
      this.setState({ passwordError: true, passwordErrorMessage: 'Password cannot be blank' });
      loginError = 1;
    }

    if (!loginError) {
      axios
        .post('/login', {
          username: this.state.username,
          password: this.state.password
        })
        .then(res => {
          //console.log(res.data);
          if (res.data.authenticationError) {
            //this.props.updateError(res.data.authenticationError);
            if (res.data.errorField === 'username') {
              this.setState({
                usernameError: true,
                usernameErrorMessage: res.data.authenticationError
              });
            } else if (res.data.errorField === 'password') {
              this.setState({
                passwordError: true,
                passwordErrorMessage: res.data.authenticationError
              });
            }
            throw new Error(res.data.authenticationError);
          }
          if (res.data.user) {
            this.props.updateUserAndOpenSocket(res.data.user);
          }
        })
        .then(() => {
          this.props.history.push('/');
        })
        .catch(error => {
          console.log(error);
          this.setState({
            checkingLoginStatus: false
          });
        });
    }
    // }
  }

  handleGithubLogin(event) {
    event.preventDefault();
    console.log(this.state.socket.id);
    window.open(
      `http://localhost:3001/githubLogin?socketId=${this.state.socket.id}`,
      '',
      `toolbar=no, location=no, directories=no, status=no, menubar=no, 
scrollbars=no, resizable=no, copyhistory=no, width=${600}, 
height=${600}, top=${window.innerHeight / 2 - 600 / 2}, left=${window.innerWidth / 2 - 600 / 2}`
    );
  }

  render() {
    return (
      <div id="LoginForm">
        <h1 id="header">Login</h1>
        <form className="center">
          <div>
            <input
              id={this.state.usernameError ? 'registrationLoginErrorInput' : 'loginUsernameInput'}
              type="text"
              name="username"
              placeholder="Username"
              value={this.state.username}
              onChange={this.handleChange}
            />
            {this.state.usernameError && (
              <p className="registrationLoginError">{this.state.usernameErrorMessage}</p>
            )}
          </div>
          <div>
            <input
              id={this.state.passwordError ? 'registrationLoginErrorInput' : 'loginPasswordInput'}
              type="password"
              name="password"
              placeholder="Password"
              value={this.state.password}
              onChange={this.handleChange}
            />
            {this.state.passwordError && (
              <p className="registrationLoginError">{this.state.passwordErrorMessage}</p>
            )}
          </div>
          <div>
            <input
              name="login"
              className="btn btn-primary btn-lg center"
              type="submit"
              value="Login"
              onClick={this.handleSubmit}
            />
          </div>
          {/* github login */}
          <div>
            {/* <a href="http://localhost:3001/githubLogin">
              <p>Github Login</p>
            </a> */}
            <button
              onClick={this.handleGithubLogin}
              type="button"
              className="btn btn-primary btn-lg center"
            >
              Github Login
            </button>
          </div>
        </form>
      </div>
    );
  }
}

export default withRouter(LoginForm);
