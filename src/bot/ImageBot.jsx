import React, { useState, useEffect } from "react";
import { Button, Textarea, Spinner } from "@chakra-ui/react";

function ImageBot() {
    const [question, setQuestion] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [containerHeight, setContainerHeight] = useState("auto");
    const [loading, setLoading] = useState(false);
    const token = "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";

    async function query() {
        const response = await fetch(
           "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3-medium-diffusers",
            {
                headers: { Authorization: `Bearer ${token}` },
                method: "POST",
                body: JSON.stringify({ "inputs": question }),
            }
        );
        if (!response.ok) {
            throw new Error("Failed to generate image.");
        }
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    }

    async function generateAnswer() {
        setLoading(true);
        try {
            const url = await query();
            setImageUrl(url);
        } catch (error) {
            console.error("Error generating image:", error);
            // Handle error: e.g., display a message to the user
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const updateContainerHeight = () => {
            if (imageUrl) {
                const img = new Image();
                img.src = imageUrl;
                img.onload = () => {
                    setContainerHeight(`${img.height}px`);
                };
            }
        };

        updateContainerHeight();
    }, [imageUrl]);

    function handleDownload() {
        if (imageUrl) {
            const a = document.createElement("a");
            a.href = imageUrl;
            a.download = "generated_image.jpg";
            a.click();
        }
    }

    return (
        <>
            <div className="chatbot-container">
                <h1 className="gradient-textI">AI Image Generator</h1>
                <Textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask me anything..."
                    id="input"
                />
                <Button onClick={generateAnswer} variant='outline' colorScheme="blue">
                    {loading ? <Spinner size="sm" /> : "Generate Image"}
                </Button>
                <div className="answer-container" style={{ height: containerHeight, display: "flex", justifyContent: "center" }}>
                    {imageUrl && (
                        <img src={imageUrl} alt="Generated Image" style={{ maxWidth: "100%", maxHeight: "100%" }} />
                    )}
                </div>
            </div>
            {imageUrl && (
                <Button onClick={handleDownload} variant="outline" colorScheme="blue" mt={8}>
                    Download Image
                </Button>
            )}
            <p>By Threaeo 2.O</p>
        </>
    );
}

export default ImageBot;
