import { SearchIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, Input, Skeleton, SkeletonCircle, Text, useColorModeValue } from "@chakra-ui/react";
import Conversation from "../components/Conversation";
import { GiConversation } from "react-icons/gi";
import MessageContainer from "../components/MessageContainer";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { useRecoilState, useRecoilValue } from "recoil";
import { conversationsAtom, selectedConversationAtom } from "../atoms/messageAtom";
import userAtom from "../atoms/userAtom";
import { useSocket } from "../context/SocketContext";
import { Link } from "react-router-dom";

const ChatPage = () => {
    const [searchingUser, setSearchingUser] = useState(false);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom);
    const [conversations, setConversations] = useRecoilState(conversationsAtom);
    const currentUser = useRecoilValue(userAtom);
    const showToast = useShowToast();
    const { socket, onlineUsers } = useSocket();

    useEffect(() => {
        socket?.on("messagesSeen", ({ conversationId }) => {
            setConversations((prev) => {
                const updatedConversations = prev.map((conversation) => {
                    if (conversation._id === conversationId) {
                        return {
                            ...conversation,
                            lastMessage: {
                                ...conversation.lastMessage,
                                seen: true,
                            },
                        };
                    }
                    return conversation;
                });
                return updatedConversations;
            });
        });
    }, [socket, setConversations]);

    useEffect(() => {
        const getConversations = async () => {
            try {
                const res = await fetch("/api/messages/conversations");
                const data = await res.json();
                if (data.error) {
                    showToast("Error", data.error, "error");
                    return;
                }
                console.log(data);
                setConversations(data);
            } catch (error) {
                showToast("Error", error.message, "error");
            } finally {
                setLoadingConversations(false);
            }
        };

        getConversations();
    }, [showToast, setConversations]);

    const handleConversationSearch = async (e) => {
    e.preventDefault();
    setSearchingUser(true);
    try {
        const res = await fetch(`/api/users/profile/${searchText}`);
        const searchedUser = await res.json();
        if (searchedUser.error) {
            showToast("Error", searchedUser.error, "error");
            return;
        }

        const messagingYourself = searchedUser._id === currentUser._id;
        if (messagingYourself) {
            showToast("Error", "You cannot message yourself", "error");
            return;
        }

        // Check if a conversation already exists with the selected user
        const conversationAlreadyExists = conversations.find(
            (conversation) => conversation.participants[0]._id === searchedUser._id
        );

        if (conversationAlreadyExists) {
            // If conversation exists, set it as the selected conversation
            setSelectedConversation({
                _id: conversationAlreadyExists._id,
                userId: searchedUser._id,
                username: searchedUser.username,
                userProfilePic: searchedUser.profilePic,
            });
        } else {
            // If conversation doesn't exist, create a new mock conversation
            const mockConversation = {
                mock: true,
                lastMessage: {
                    text: "", // Add the shared post content here if needed
                    sender: "", // Add the sender's username here if needed
                },
                _id: Date.now(), // Generate a unique ID for the conversation
                participants: [
                    {
                        _id: searchedUser._id,
                        username: searchedUser.username,
                        profilePic: searchedUser.profilePic,
                    },
                ],
            };
            // Add the mock conversation to the conversations array
            setConversations((prevConvs) => [...prevConvs, mockConversation]);
            // Set the newly created conversation as the selected conversation
            setSelectedConversation({
                _id: mockConversation._id,
                userId: searchedUser._id,
                username: searchedUser.username,
                userProfilePic: searchedUser.profilePic,
            });
        }
    } catch (error) {
        showToast("Error", error.message, "error");
    } finally {
        setSearchingUser(false);
    }
};

    return (
        <Box
            position={"absolute"}
            left={"50%"}
            w={{ base: "100%", md: "80%", lg: "750px" }}
            p={4}
            transform={"translateX(-50%)"}
        >
            <Flex
                gap={4}
                flexDirection={{ base: "column", md: "row" }}
                maxW={{
                    sm: "400px",
                    md: "full",
                }}
                mx={"auto"}
            >
                	
                <Flex flex={30} gap={2} flexDirection={"column"} maxW={{ sm: "250px", md: "full" }} mx={"auto"}>
                    <Text fontWeight={700} color={useColorModeValue("gray.600", "gray.400")}>
                        Your Conversations
                    </Text>
                    <Link to="/chatbot">
                    <Button
                        colorScheme="blue"
                        variant="outline"
                        position="fixed"
                        bottom={{ base: "43rem", md: "36rem", lg: "36rem" }} // Adjust bottom position for different screen sizes
                        left={{ base: "25rem", md: "6rem", lg: "10rem" }} // Adjust left position for different screen sizes
                        padding={{ base: "8px 12px", md: "10px 15px", lg: "12px 18px" }} // Adjust padding for different screen sizes
                        fontSize={{ base: "14px", md: "16px", lg: "18px" }} // Adjust font size for different screen sizes
                        zIndex="9999"
                        boxShadow="0px 0px 15px 0px rgba(0, 123, 255, 0.7)">
                AI chat
            </Button>
            </Link>
                    <form onSubmit={handleConversationSearch}>
                        <Flex alignItems={"center"} gap={2}>
                            <Input placeholder='Search for a user' onChange={(e) => setSearchText(e.target.value)} />
                            <Button size={"sm"} onClick={handleConversationSearch} isLoading={searchingUser}>
                                <SearchIcon />
                            </Button>
                        </Flex>
                    </form>
                    {loadingConversations &&
                        [0, 1, 2, 3, 4].map((_, i) => (
                            <Flex key={i} gap={4} alignItems={"center"} p={"1"} borderRadius={"md"}>
                                <Box>
                                    <SkeletonCircle size={"10"} />
                                </Box>
                                <Flex w={"full"} flexDirection={"column"} gap={3}>
                                    <Skeleton h={"10px"} w={"80px"} />
                                    <Skeleton h={"8px"} w={"90%"} />
                                </Flex>
                            </Flex>
                        ))}

                    {!loadingConversations &&
                        conversations.map((conversation) => (
                            <Conversation
                                key={conversation._id}
                                isOnline={onlineUsers.includes(conversation.participants[0]._id)}
                                conversation={conversation}
                            />
                        ))}
                </Flex>
                {!selectedConversation._id && (
                    <Flex
                        flex={70}
                        borderRadius={"md"}
                        p={2}
                        flexDir={"column"}
                        alignItems={"center"}
                        justifyContent={"center"}
                        height={"400px"}
                    >
                        <GiConversation size={100} />
                        <Text fontSize={20}>Select a conversation to start messaging</Text>
                    </Flex>
                )}

                {selectedConversation._id && <MessageContainer />}
            </Flex>
            
        </Box>
    );
};

export default ChatPage;
