import React, { useState, useEffect } from "react";
import axios from "axios";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import mic from "../assets/images/mic.svg";
import stop from '../assets/images/stop.svg';
import volume from "../assets/images/volume.svg";
import rightArrow from "../assets/images/rightArrow.svg";
import copyIcon from "../assets/images/copyIcon.svg"
import "../styles/TextTranslator.css";

const TextTranslator = () => {
  const [from, setFrom] = useState("en");
  const [to, setTo] = useState("hi");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [languages, setLanguages] = useState([]);
  const [copied, setCopied] = useState(false); // State to track if text has been copied

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await axios.get(
          "https://libretranslate.com/languages",
          { headers: { accept: "application/json" } }
        );
        setLanguages(response.data);
      } catch (error) {
        console.log("error", error);
      }
    };

    fetchLanguages();
  }, []);

  const handleTranslate = async () => {
    try {
      const response = await axios.post(
        "https://text-translator-be.onrender.com/translator/translate-input-text",
        {
          inputText: transcript ? transcript : inputText,
          fromLang: from,
          toLang: to,
        }
      );
      setOutputText(response.data.translatedText);
    } catch (error) {
      console.error("Translation error:", error);
    }
  };

  const handleSourceSpeech = () => {
    let utterance = new SpeechSynthesisUtterance(inputText);
    speechSynthesis.speak(utterance);
  };

  const handleTargetSpeech = () => {
    let utterance = new SpeechSynthesisUtterance(outputText);
    utterance.lang = to;
    speechSynthesis.speak(utterance);
  };

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  const handleCopyText = () => {
    navigator.clipboard.writeText(outputText).then(() => {
      setCopied(true); // Change copy status to true
  
      // Reset copy status after 1 second
      setTimeout(() => {
        setCopied(false);
      }, 1000);
    });
  };

const handleReset=()=>{
    resetTranscript()
    setInputText("")
}

const handleClearText=()=>{
  setOutputText("")
}

  return (
    <div className="translator-container" style={{backgroundColor:"#e6f4fc"}}>
    <p className="text-translator-p">Punt-Partner Text Translator</p>
      <div className="translator-main">
        <div className="translator-column">
          <div className="translator-controls">
            <img onClick={SpeechRecognition.startListening} width={"20px"} src={mic} alt="Mic" />
            <img className={listening ? 'translator-listening' : ''} onClick={SpeechRecognition.stopListening} src={stop} width={"25px"} alt="Stop" />
            <button onClick={handleReset}>Reset</button>
            <select onChange={(e) => setFrom(e.target.value)} style={{color:"#04b0ad"}} >
              <option value="">From-Language</option>
              {languages.map((item, i) => (
                <option key={i} value={item.code}>{item.name}</option>
              ))}
            </select>
            <img onClick={handleSourceSpeech} width={"25px"} src={volume} alt="Volume" />
          </div>
          <textarea
            onChange={(e) => setInputText(e.target.value)}
            value={transcript ? transcript : inputText}
            placeholder="Enter your text"
            rows={15}
            cols={50}
          ></textarea>
        </div>
        <img src={rightArrow} alt="" srcset="" style={{marginBottom:"90px"}}/>
        <div className="translator-column">
          <div className="translator-controls">
          <button onClick={handleClearText}>Clear Text</button>
            <select onChange={(e) => setTo(e.target.value)} style={{color:"#04b0ad"}}>
              <option value="">To-Language</option>
              {languages.map((item, i) => (
                <option key={i} value={item.code}>{item.name}</option>
              ))}
            </select>
            <img onClick={handleTargetSpeech} width={"25px"} src={volume} alt="Volume" />
            {outputText && !copied && ( // Show copy icon only when there's text and it hasn't been copied
              <img onClick={handleCopyText} src={copyIcon} width={"25px"} alt="Copy" />
            )}
            {copied && ( // Show a message or change icon color when text is copied
              <span style={{ color: "orange" , marginTop:"20px"}}>Copied!</span>
            )}
          </div>
          <textarea
            readOnly
            value={outputText}
            placeholder="Your Translated Text"
            rows={15}
            cols={50}
          ></textarea>
        </div>
      </div>
      <button onClick={handleTranslate} style={{width:"150px", height:"40px",fontSize:'20px'}}>Translate</button>
    </div>
  );
};

export default TextTranslator;
