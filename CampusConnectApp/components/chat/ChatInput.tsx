import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  ActivityIndicator,
} from "react-native";
import { IconButton, Surface } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { ChatMessage } from "@/shared/services/socketService";
import { Colors } from "@/constants/theme";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onSendMedia?: (
    media: { uri: string; type: string; name: string },
    message?: string
  ) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  messages?: ChatMessage[]; // Array of chat messages for summary
}

// Predefined list of inappropriate words
const BAD_WORDS = [
  "fuck",
  "shit",
  "ass",
  "damn",
  "bastard",
  "crap",
  "piss",

];

const FREE_MODELS = [
  "deepseek/deepseek-chat-v3.1:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "microsoft/phi-3-mini-128k-instruct:free",
  "huggingfaceh4/zephyr-7b-beta:free",
];

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onSendMedia,
  onTyping,
  disabled = false,
  messages = [],
}) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const inputRef = useRef<TextInput>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const containsBadWords = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return BAD_WORDS.some((word) => {
      // Check for whole word matches and variations with special characters
      const regex = new RegExp(
        `\\b${word}\\b|${word.split("").join("[\\s\\*\\@\\#\\$]*")}`,
        "i"
      );
      return regex.test(lowerText);
    });
  };

  const handleTextChange = (text: string) => {
    setMessage(text);

    // Handle typing indicator
    if (onTyping) {
      if (!isTyping && text.length > 0) {
        setIsTyping(true);
        onTyping(true);
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        if (isTyping) {
          setIsTyping(false);
          onTyping(false);
        }
      }, 1000);
    }
  };

  const handleSend = () => {
    if (!message.trim() || disabled) return;

    const messageText = message.trim();

    // Check for inappropriate content
    if (containsBadWords(messageText)) {
      setWarningMessage(
        "Cannot send message with inappropriate language. Please keep the conversation respectful."
      );
      setShowWarningModal(true);
      return;
    }

    setMessage("");
    setIsTyping(false);
    onTyping?.(false);

    onSendMessage(messageText);
  };

  const generateChatSummary = async () => {
    if (!messages || messages.length === 0) {
      Alert.alert("No Messages", "There are no messages to summarize.");
      return;
    }

    // Open modal immediately with loading state
    setLoadingSummary(true);
    setSummaryText("");
    setShowSummaryModal(true);

    // Use setTimeout to ensure state updates before async operation
    setTimeout(async () => {
      try {
        // Format chat messages
        let filterdMessages = messages
          .reverse()
          .slice(0, 20)
          .filter((item: any) => item.messageType == "text");
        const chatText = filterdMessages
          .map((msg) => `${msg.senderName}: ${msg.message}`)
          .join("\n");

        console.log("Formatted chat text:", chatText);

        // Call OpenRouter API
        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization:
                "Bearer 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",
              "HTTP-Referer": "",
              "X-Title": "",
            },
            body: JSON.stringify({
              model: "deepseek/deepseek-chat-v3.1:free",
              messages: [
                {
                  role: "system",
                  content: `You are a chat summarizer. Provide a ONE-LINE summary only. 
            
Rules:
- If the chat contains important information (announcements, results, deadlines), EXTRACT the specific details (what exam/assignment, what's announced)
- Ignore casual messages - focus ONLY on important announcements
- Be precise with details (mention specific subjects, assignments, exams mentioned)
- Keep it under 20 words

Examples:
- "4-1 assignment results published"
- "Mid-term exam results for Mathematics announced"
- "Project submission deadline: March 15th"
- "Casual chat only" (only if no important info exists)`,
                },
                {
                  role: "user",
                  content: `Summarize this chat in ONE line:\n\n${chatText}`,
                },
              ],
            }),
          }
        );

        const data = await response.json();
        console.log("API Response:", data);

        if (data.error) {
          setSummaryText("Failed to generate summary. Please try again.");
          setShowSummaryModal(false);
        }

        if (data.choices && data.choices[0]?.message?.content) {
          // Clean up the response text (remove special tokens if any)
          let summaryContent = data.choices[0].message.content;
          summaryContent = summaryContent
            .replace(/<｜begin▁of▁sentence｜>/g, "")
            .trim();
          setSummaryText(summaryContent);
        } else {
          throw new Error("Invalid response from API");
        }
      } catch (error) {
        console.error("Error generating summary:", error);
        setSummaryText("Failed to generate summary. Please try again.");
      } finally {
        setLoadingSummary(false);
      }
    }, 100);
  };

  const generateFallbackSummary = (messages: ChatMessage[]): string => {
    const filteredMessages = messages
      .slice()
      .reverse()
      .slice(0, 20)
      .filter((item: any) => item.messageType === "text");

    if (filteredMessages.length === 0) {
      return "No text messages to summarize";
    }

    // Look for keywords that might indicate important information
    const importantKeywords = [
      "assignment",
      "exam",
      "test",
      "deadline",
      "result",
      "grade",
      "announcement",
      "meeting",
      "project",
      "submission",
      "due",
    ];

    const importantMessages = filteredMessages.filter((msg) =>
      importantKeywords.some((keyword) =>
        msg.message.toLowerCase().includes(keyword)
      )
    );

    if (importantMessages.length > 0) {
      const latestImportant = importantMessages[0];
      return `${latestImportant.senderName} mentioned ${latestImportant.message}`;
    }

    // If no important messages, provide basic summary
    const uniqueSenders = [
      ...new Set(filteredMessages.map((msg) => msg.senderName)),
    ];
    const messageCount = filteredMessages.length;

    if (uniqueSenders.length === 1) {
      return `${messageCount} messages from ${uniqueSenders[0]}`;
    } else {
      return `${messageCount} messages from ${
        uniqueSenders.length
      } participants: ${uniqueSenders.slice(0, 2).join(", ")}${
        uniqueSenders.length > 2 ? " and others" : ""
      }`;
    }
  };

  const generateChatSummaryV2 = async () => {
    if (!messages || messages.length === 0) {
      Alert.alert("No Messages", "There are no messages to summarize.");
      return;
    }

    // Open modal immediately with loading state
    setLoadingSummary(true);
    setSummaryText("");
    setShowSummaryModal(true);

    // Use setTimeout to ensure state updates before async operation
    let filteredMessages = messages
      .slice() // Create a copy to avoid mutating original
      .reverse()
      .slice(0, 20)
      .filter((item: any) => item.messageType == "text");

    const chatText = filteredMessages
      .map((msg) => `${msg.senderName}: ${msg.message}`)
      .join("\n");

    for (let i = 0; i < FREE_MODELS.length; i++) {
      const modelName = FREE_MODELS[i];

      try {
        console.log(`Attempting with model: ${modelName}`);

        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization:
                "Bearer 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",
              "HTTP-Referer": "",
              "X-Title": "",
            },
            body: JSON.stringify({
              model: modelName,
              messages: [
                {
                  role: "system",
                  content: `You are a chat summarizer. Provide a ONE-LINE summary only. 
            
Rules:
- If the chat contains important information (announcements, results, deadlines), EXTRACT the specific details (what exam/assignment, what's announced)
- Ignore casual messages - focus ONLY on important announcements
- Be precise with details (mention specific subjects, assignments, exams mentioned)
- Keep it under 20 words

Examples:
- "4-1 assignment results published"
- "Mid-term exam results for Mathematics announced"
- "Project submission deadline: March 15th"
- "Casual chat only" (only if no important info exists)`,
                },
                {
                  role: "user",
                  content: `Summarize this chat in ONE line:\n\n${chatText}`,
                },
              ],
            }),
          }
        );

        const data = await response.json();

        // Check if there's an error in the response
        if (data.error) {
          console.error(`Model ${modelName} failed:`, data.error.message);

          // If it's a capacity error and we have more models to try, continue
          if (
            (data.error.message.includes("at capacity") ||
              data.error.message.includes("Provider returned error")) &&
            i < FREE_MODELS.length - 1
          ) {
            console.log("Trying next model...");
            continue;
          }

          // If it's the last model or a different error, throw
          throw new Error(data.error.message);
        }

        // Success! Return the summary
        const summary = data.choices[0].message.content.trim();
        console.log("Summary generated successfully:", summary);
        setSummaryText(summary);
        setLoadingSummary(false);
        return;
      } catch (error) {
        console.error(`Error with model ${modelName}:`, error);

        // If this was the last model, return fallback
        if (i === FREE_MODELS.length - 1) {
          console.log("All models failed, using fallback summary");
          const fallbackSummary = generateFallbackSummary(filteredMessages);
          setSummaryText(fallbackSummary);
          setLoadingSummary(false);
          return;
        }

        // Otherwise, try the next model
        console.log("Trying next model...");
      }
    }

    // This shouldn't be reached, but just in case
    return true;
  };

  const handleImagePicker = async () => {
    if (disabled) return;

    try {
      // Request permission
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Permission to access camera roll is required!"
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.3,
        base64: true,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.base64) {
          // Create base64 string with data URL format (same as market post)
          const base64Image = `data:image/jpeg;base64,${asset.base64}`;
          const media = {
            uri: base64Image,
            type: "image",
            name: asset.fileName || `image_${Date.now()}.jpg`,
          };

          onSendMedia?.(media, message.trim() || undefined);
          setMessage("");
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleDocumentPicker = async () => {
    if (disabled) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const media = {
          uri: asset.uri,
          type: "file",
          name: asset.name || `file_${Date.now()}`,
        };

        onSendMedia?.(media, message.trim() || undefined);
        setMessage("");
      }
    } catch (error) {
      console.error("Error opening document picker:", error);
      Alert.alert("Error", "Failed to open document picker");
    }
  };

  const handleMediaPicker = async () => {
    console.log("Media picker button pressed, disabled:", disabled);

    if (disabled) {
      console.log("Media picker disabled, returning");
      return;
    }

    console.log("Showing media picker alert");

    Alert.alert("Select Media", "Choose an option", [
      {
        text: "Photo Library",
        onPress: () => {
          console.log("Photo Library selected");
          handleImagePicker();
        },
      },
      {
        text: "Document",
        onPress: () => {
          console.log("Document selected");
          handleDocumentPicker();
        },
      },
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => console.log("Media picker cancelled"),
      },
    ]);
  };

  const handleImagePickerV2 = async () => {
    try {
      // Request permission
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Permission to access camera roll is required!"
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.3,
        base64: true,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.base64) {
          // Create base64 string with data URL format
          const base64Image = `data:image/jpeg;base64,${asset.base64}`;
          const media = {
            uri: base64Image,
            type: "image",
            name: asset.fileName || `image_${Date.now()}.jpg`,
          };

          onSendMedia?.(media, message.trim() || undefined);
          setMessage("");
          console.log(base64Image);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.inputContainer} elevation={2}>
        <TouchableOpacity
          onPress={handleImagePickerV2}
          disabled={disabled}
          style={styles.attachButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons
            name="attach-file"
            size={24}
            color={disabled ? Colors.light.icon : Colors.light.tint}
          />
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor={Colors.light.icon}
          value={message}
          onChangeText={handleTextChange}
          multiline
          maxLength={1000}
          editable={!disabled}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />

        <TouchableOpacity
          onPress={generateChatSummaryV2}
          disabled={disabled}
          style={styles.summaryButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons
            name="info-outline"
            size={20}
            color={disabled ? Colors.light.icon : Colors.light.tint}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!message.trim() || disabled) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!message.trim() || disabled}
        >
          <MaterialIcons
            name="send"
            size={20}
            color={!message.trim() || disabled ? Colors.light.icon : "white"}
          />
        </TouchableOpacity>
      </Surface>

      {/* Summary Modal */}
      <Modal
        visible={showSummaryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSummaryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chat Summary</Text>
              <TouchableOpacity
                onPress={() => setShowSummaryModal(false)}
                style={styles.closeButton}
              >
                <MaterialIcons
                  name="close"
                  size={24}
                  color={Colors.light.text}
                />
              </TouchableOpacity>
            </View>

            {loadingSummary ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.tint} />
                <Text style={styles.loadingText}>Generating summary...</Text>
              </View>
            ) : (
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryText}>{summaryText}</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Warning Modal */}
      <Modal
        visible={showWarningModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWarningModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.warningHeader}>
              <MaterialIcons name="warning" size={48} color="#f44336" />
            </View>

            <View style={styles.warningBody}>
              <Text style={styles.warningTitle}>Inappropriate Content</Text>
              <Text style={styles.warningText}>{warningMessage}</Text>
            </View>

            <TouchableOpacity
              style={styles.warningButton}
              onPress={() => setShowWarningModal(false)}
            >
              <Text style={styles.warningButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9fa",
  },
  replyPreview: {
    margin: 16,
    marginBottom: 8,
    padding: 12,
    backgroundColor: "white",
    borderRadius: 8,
  },
  replyContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  replyBar: {
    width: 3,
    height: "100%",
    backgroundColor: Colors.light.tint,
    borderRadius: 1.5,
    marginRight: 12,
  },
  replyText: {
    flex: 1,
  },
  replyAuthor: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.tint,
    marginBottom: 2,
  },
  replyMessage: {
    fontSize: 14,
    color: Colors.light.text,
  },
  cancelReplyButton: {
    margin: 0,
    width: 32,
    height: 32,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    margin: 16,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: "white",
    borderRadius: 24,
    minHeight: 48,
  },
  attachButton: {
    margin: 0,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 100,
    ...Platform.select({
      ios: {
        paddingTop: 8,
      },
      android: {
        paddingTop: 6,
      },
    }),
  },
  summaryButton: {
    margin: 0,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    marginLeft: 4,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.tint,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: "#e0e0e0",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.light.text,
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.icon,
  },
  summaryContainer: {
    padding: 20,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.light.text,
  },
  warningHeader: {
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 20,
  },
  warningBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f44336",
    textAlign: "center",
    marginBottom: 12,
  },
  warningText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.light.text,
    textAlign: "center",
  },
  warningButton: {
    backgroundColor: "#f44336",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  warningButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
