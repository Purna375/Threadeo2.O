import { Button, Textarea } from "@chakra-ui/react";
import axios from "axios";
import React from "react";
import { useState } from "react";
import "./botStyle.css";
import { Link } from "react-router-dom";
function ChatBot() {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    

    async function generateAnswer() {
       setAnswer("Chai Ai is Typing.....");
        const response = await axios({
            url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyCtKn9ug6I3V3o14ie2gFLvlNxXkPFhT5g",
            method: "POST",
            data: {
                contents: [
                    {
                        parts: [
                            { text: question }
                        ]
                    }
                ]
            }
        });
            setAnswer(response['data']['candidates'][0]['content']['parts'][0]['text']);
    }

    return (
        <>
             <div className="chatbot-container">
            <h1 className="gradient-textI">Gemini AI</h1>
            <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask me anything..."
            />
            <Button onClick={generateAnswer} variant='outline' colorScheme="blue">
                Generate Answer
            </Button>
            <div className="answer-container">
                {answer && <pre>{answer}</pre>}
            </div>
        </div>
        <p>powerded by google</p>
        <Link to="/imagebot">
        <Button
            colorScheme="blue"
            variant="outline"
            position="fixed"
            bottom={{ base: "6rem", md: "36rem", lg: "36rem" }} // Adjust bottom position for different screen sizes
            left={{ base: "15rem", md: "6rem", lg: "10rem" }} // Adjust left position for different screen sizes
            padding={{ base: "8px 12px", md: "10px 15px", lg: "12px 18px" }} // Adjust padding for different screen sizes
            fontSize={{ base: "14px", md: "16px", lg: "18px" }} // Adjust font size for different screen sizes
            zIndex="9999"
            boxShadow="0px 0px 15px 0px rgba(0, 123, 255, 0.7)">
             AI Image Generator
        </Button>
        </Link>
        </>
    );
}

export default ChatBot;
