import { View, Text , Image, ScrollView, TouchableOpacity, Alert} from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { SafeAreaView } from 'react-native-safe-area-context';
import Features from '../components/features';
import { dummyMessages } from '../constants/dummy';
import Voice from '@react-native-community/voice';
//import * as Permissions from 'expo-permissions';
import { Permissions } from "expo-permissions";
import { apiCall } from '../api/openAI';




export default function HomeScreen()
{
  const [messages, setMessages]= useState([]);
  const [recording, setRecording] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [result, setResult] = useState('');
  const [loading, setLoading]= useState(false);
  const ScrollViewRef=useRef();

  const speechStartHandler= e=>{
    console.log('speech start handler');
  }


  const speechResultsHandler= e=>{
    console.log('voice event: ',e);
    const text = e.value[0];
    setResult(text);

  }

  const speechErrorHandler= e=>{
    console.log('speech error handler: ',e);
  }

  const speechEndHandler= e=>{
    setRecording(false);
    console.log('speech stop handler');
  }

  const startRecording = async()=>{
       setRecording(true);
        try {
            await Voice.start('en-GB');
          }catch (error) {
          console.log('Error starting recording: ', error);
        }
      }

  const stopRecording = async()=>{
    try{
        await Voice.stop();
        setRecording(false);
        console.log('stop rev')
        //fetch the result from chatgpt
        fetchResponse();
    }catch(error){
      console.log('error: ',error);
    }
  }


  const fetchResponse= ()=>{
    console.log("FETCH")
    if(result.trim().length>0){
      let newMessages = [...messages];
      newMessages.push({role: 'user', content: result.trim()});
      setMessages([...newMessages]);
      updateScrollView();
      setLoading(true);

      apiCall(result.trim(), newMessages).then(res=>{
        console.log('got api data:',res);
        setLoading(false);
          if(res.success){
            setMessages([...res.data]);
            updateScrollView();
            setResult('');
          }else{
            Alert.alert('Error', res.message)
          }
      })
    }
  }

  const updateScrollView = () =>{
    setTimeout(() =>{
      ScrollViewRef?.current?.scrollToEnd({animated: true})
    }, 200)

  }




  const clear = ()=>{
    setMessages([]);
  }

  const stopSpeaking=()=>{

    setSpeaking(false);
  }

  
  useEffect(()=>{
    //voice handler event
    Voice.onSpeechStart = speechStartHandler;
    Voice.onSpeechEnd = speechEndHandler;
    Voice.onSpeechResults =speechResultsHandler;
    Voice.onSpeechError= speechErrorHandler;

    return()=>{
        //destroy the voice instance
        Voice.destroy().then(Voice.removeAllListeners);
    }

  },[])

  console.log('result: ',result);


return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1 flex mx-5">
        {/* bot icon */}
        <View className="flex-row justify-center">
          <Image source={require('../../assets/images/bot.png')} style={{height: hp(15), width: hp(15),marginTop:5}} />

        </View>

        {/* features|| messages */}
        {
          messages.length>0?(
            <View className="space-y-2 flex-1">
              <Text style={{fontSize: wp(5)}} className="text-gray-700 font-semibold ml-1">
                Assistant
              </Text>

              <View
                  style={{height: hp(58)}}
                  className="bg-neutral-200 rounded-3xl p-4"
              >
              <ScrollView
                    ref={ScrollViewRef}
                    bounces={false}
                    className="space-y-4"
                    showsVerticalScrollIndicator={false}
                >
                  {
                      messages.map((message, dummy)=>{
                        if(message.role=='assistant'){
                          if(message.content.includes('https')){
                            //its an ai image
                            return(
                              <View key={dummy} className="flex-row justify-start">
                                <View className="p-2 flex rounded-2xl bg-emerald-100 rounded-tl-none">
                                    <Image
                                        source={{uri: message.content}}
                                        className="rounded-2xl"
                                        resizeMode='contain'
                                        style={{height: wp(60), width: wp(60)}}
                                      />
                                </View>
                            </View>
                            )
                          }else{
                            //test response
                            return(
                              <View
                                key={dummy}
                                style={{width: wp(70)}}
                                className="bg-emerald-100 rounded-xl p-2 rounded-tl-none-none">
                                  <Text>
                                    {message.content}
                                  </Text>
                                </View>
                              
                            )
                          }
                        }else{
                          //user input
                          return(
                            <View key={dummy} className="flex-row justify-end">
                            <View
                              style={{width: wp(70)}}
                              className="bg-white rounded-xl p-2 rounded-tr-none">
                                <Text>
                                  {message.content}
                                </Text>
                              </View>
                            </View>
                          );
                        
                        }
                      
                      })
                  }                

              </ScrollView>
            </View>
          </View>
          ) :(
            <Features />
          )
        }
        {/* recording, clear and stop buttons*/}
        <View className="flex justify-center items-center">
          {
            loading? (
              <Image
                source={require('../../assets/images/voiceLoading.gif')}
                style={{width: hp(10), height: hp(10)}}
            />

            ):
             recording? (
              <TouchableOpacity onPress={stopRecording}>
                 {/* recording stop button */}
              <Image
                className="rounded-full"
                source={require('../../assets/images/voiceLoading.gif')}
                style={{width: hp(10), height: hp(10)}}/>
                </TouchableOpacity>

            ):(
              <TouchableOpacity onPress={startRecording}>
                {/* recording start button */}
              <Image
                className="rounded-full"
                source={require('../../assets/images/recordingIcon.png')}
                style={{width: hp(10), height: hp(10)}}/>
                </TouchableOpacity>

            )
          }

          {
            messages.length>0 && (
              <TouchableOpacity
                  onPress={clear}
                  className= "bg-neutral-400 rounded-3xl p-2 absolute right-10">
                    <Text className= "text-white font-semibold">Clear</Text>

              </TouchableOpacity>
            )
          }

          {
            speaking && (
              <TouchableOpacity
                  onPress={stopSpeaking}
                  className= "bg-red-400 rounded-3xl p-2 absolute left-10">
                    <Text className= "text-white font-semibold">Stop</Text>

              </TouchableOpacity>
            )
          }


      

        </View>
      </SafeAreaView> 
    </View>
  );
}
