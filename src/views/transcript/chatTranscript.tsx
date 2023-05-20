import React, { Component, Fragment } from "react"; 
import ChatTranscriptComponent from "../../components/transcript/index";
import EventEmitter from '../../services/eventemitter'
import { Events } from '../../models/events';


interface MainChatState {
   currentText: string;
}

class ChatTranscript extends Component<{},MainChatState>{
   constructor(props) {
      super(props);
      this.state = {
         currentText: '',}
         EventEmitter.on(Events.onResourceUser, this.onPreviewMessage); 
   }

  componentDidUpdate(){
  }

  onPreviewMessage = (text: string) => {
   this.setState({ currentText: text });
  } 

   render() {
      return (
         <> 
          <ChatTranscriptComponent/>
         </>
      );
   }
}

export default ChatTranscript;
