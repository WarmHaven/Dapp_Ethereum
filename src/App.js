import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import './App.css';
import Web3 from 'web3';
import { Button, Checkbox, Icon, Table, Label, Menu, Rating, Input }from 'semantic-ui-react';
import { Modal } from 'react-pure-css-modal';
import 'semantic-ui-css/semantic.min.css';
import mockData from './mockData/';

import clubContract from './Contract';



const web3 = new Web3();
window.web3 = web3;
const Contract = web3.eth.contract(clubContract.ABI).at(clubContract.address);
window.Contract = Contract;

class App extends Component {


  constructor(){
    super();
    this.state={
      activePage:'',
      mockData:[],
      addUser_name:'',
      addUser_email:'',
      upgradeUser_ID:'',
      upgradeUser_level:'',
      pageMember:[]


    }
  }


  componentWillMount(){
    web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545')); //指定為RPC server的位置

    let memberNum = Contract.how_many_members().toNumber();
    let members = [];
    for(let i =0 ; i< memberNum; i++){
      let _member = Contract.members(i);
      let member = {
        id: i,
        signIn: _member[2],
        name: _member[0],
        registerTimestamp: _member[4].toNumber() * 10 ** 3,
        email: _member[1],
        level: _member[3].toNumber()
      }
      members.push(member);
      this.setState({ member });
      let pageMember = members.slice(0,10);
      this.setState({ pageMember });
    }

  }

  handlePageClick = (e, { page })  => {
    this.setState({ activePage: page });
    let pageMember = this.state.members.slice((page - 1) * 10, page * 10)
    this.setState({ pageMember });
  }


  addMember(){
    const context = this;
    if(!this.state.addUser_name || !this.state.addUser_email){
        alert('請輸入會員名稱與Email');
        return
    }
    Contract.add_member(this.state.addUser_name, this.state.addUser_email,
        {from: web3.eth.accounts[0], gas:132700}
        , function (err, result) {
            if(err) console.log(err);
            console.log(result);
            context.setState({
              addUser_name:'',
              addUser_email:''
            })
            alert('新增成功');
            window.location.reload();
        });
  }
  


  upgradeMember(){

    const context = this;
    if(!this.state.upgradeUser_ID || !this.state.upgradeUser_level){
      alert('請輸入會員ID與升級之等級');
      return
    }

    Contract.upgrade_member(this.state.upgradeUser_ID, this.state.upgradeUser_level,
        { from: web3.eth.accounts[0], gas:132700}
        , function (err,result){
          if(err) console.log(err);
          context.setState({
            upgradeUser_ID:'',
            upgradeUser_level:''
          })
          alert('更新成功');
          window.location.reload();
        });
  }


  deleteMember(){
    const context = this;
    if(!this.state.upgradeUser_ID){
      alert('請輸入會員ID');
      return
    }

    Contract.remove_member(this.state.upgradeUser_ID,
      { from:web3.eth.accounts[0], gas:132700 }
      , function(err,result){
        if (err) console.log(err);
        context.setState({
          upgradeUser_ID:''
        })
        alert('刪除成功');
        window.location.reload();
      });
  }




  signIn(id){
    Contract.signIn(id, {from: web3.eth.accounts[0], gas:132700}
    , function (err,result){
      if(err) console.log(err);
      alert(`登記簽到成功 ID: ${id}`);
      window.location.reload();
    });
  }


  resetSignIn(){
    Contract.reset_signIn({ from: web3.eth.accounts[0], gas: 132700}
      , function (err,result){
        if(err) console.log(err);
        alert('重置簽到成功');
        window.location.reload();
      });
  }



  render() {
    return (
      <div className="App">
        <h1 style={{ marginTop: "30px"}}>員工管理</h1>
      <div style={{ width: '70%', margin: '0 auto', marginTop: "30px"}}>
      <Table celled definition>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>簽到</Table.HeaderCell>
            <Table.HeaderCell>ID</Table.HeaderCell>
            <Table.HeaderCell>名稱</Table.HeaderCell>
            <Table.HeaderCell>註冊日期</Table.HeaderCell>
            <Table.HeaderCell>E-mail</Table.HeaderCell>
            <Table.HeaderCell>員工等級</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        
            <Table.Body>
              {
                this.state.pageMember.map(member => (
                  <Table.Row key={member.id}>
                    <Table.Cell collapsing>
                      <Checkbox onChange={() => this.signIn(member.id)} slider defaultChecked={member.signIn} disabled={member.signIn} />
                    </Table.Cell>
                    <Table.Cell>{member.id}</Table.Cell>
                    <Table.Cell>{member.name}</Table.Cell>
                    <Table.Cell>{new Date(member.registerTimestamp).toString()}</Table.Cell>
                    <Table.Cell>{member.email}</Table.Cell>
                    <Table.Cell> <Rating disabled icon='star' defaultRating={member.level} maxRating={5} /></Table.Cell>
                  </Table.Row>
                ))
              }
            </Table.Body>


        <Table.Footer fullWidth>
          <Table.Row>
            <Table.HeaderCell />
              <Table.HeaderCell colSpan='6'>
                <Button onClick={() => document.getElementById('deleteMember').click()} color="red" floated='right' icon labelPosition='left' size='small'>
                  <Icon name='user' /> 刪除員工
                </Button>

                <Button onClick={() => document.getElementById('upgradeMember').click()} color="yellow" floated='right' icon labelPosition='left' size='small'>
                  <Icon name='user' /> 升級員工
                </Button>
                <Button style={{ marginLeft: '20px'}} onClick={() => document.getElementById('addMember').click()} color="teal" floated='right' icon labelPosition='left' size='small'>
                  <Icon name='user' /> 新增員工
                </Button>
                <Button style={{ marginLeft: '20px'}} onClick={() => this.resetSignIn()} floated='right' icon labelPosition='left' size='small'>
                  <Icon name='hourglass end' /> 重置簽到
                </Button>



                <Menu activeIndex={2} pagination>
                  <Menu.Item icon>
                    <Icon name='left chevron' />
                  </Menu.Item>
                  {
                    [1, 2, 3, 4].map(item =>(
                      <Menu.Item as="a" page={item} active={this.state.activePage === item} onClick={this.handlePageClick}>{item}</Menu.Item>
                    ))
                  }
                  <Menu.Item icon>
                    <Icon name='right chevron' />
                  </Menu.Item>
                </Menu>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>
        </Table>
      </div>

      <Modal id="addMember">
        <h2 style={{ marginTop: '25px' }}>新增員工</h2>
        <div style={{ marginTop: '50px' }}>
          <Input onChange={(e)=>this.setState({addUser_name: e.target.value})} placeholder='姓名' /><br /><br />
          <Input onChange={(e) => this.setState({addUser_email: e.target.value})} placeholder='Email' /><br /><br />
          <Button onClick={() => this.addMember()} color='teal'>新增</Button>
        </div>
      </Modal>
      <Modal id="upgradeMember" onClose={() => { console.log("upgradeMember Modal close") }}>
        <h2 style={{ marginTop: '25px' }}>升級員工</h2>
        <div style={{ marginTop: '50px' }}>
          <Input onChange={(e) => this.setState({ upgradeUser_ID: e.target.value})} placeholder='ID' /><br /><br />
          <Input onChange={(e) => this.setState({ upgradeUser_level: e.target.value})} placeholder='等級' /><br /><br />
          <Button onClick={() => this.upgradeMember()} color='yellow'>升級</Button>
        </div>
      </Modal>

      <Modal id="deleteMember" onClose={() => { console.log("deleteMember Modal close") }}>
        <h2 style={{ marginTop: '25px' }}>刪除員工</h2>
        <div style={{ marginTop: '50px' }}>
          <Input onChange={(e) => this.setState({ upgradeUser_ID: e.target.value})} placeholder='ID' /><br /><br />
          <Button onClick={() => this.deleteMember()} color='red'>刪除</Button>
        </div>
      </Modal>

    </div>

    );
  }
}

export default App;
