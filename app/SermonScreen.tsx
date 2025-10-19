// app/SermonScreen.tsx
import React, { useState, useEffect } from "react";
import { ScrollView, TextInput, View, Text, StyleSheet } from "react-native";
import axios from "axios";
import { API_BIBLE_KEY, API_BIBLE_BASE } from "@env";
import { bcv_parser as BcvParser } from "bible-passage-reference-parser/js/en_bcv_parser";

const bcv = new BcvParser();

export default function SermonScreen() {
  const [text, setText] = useState("");
  const [verseText, setVerseText] = useState("");

  useEffect(() => {
    const match = findReference(text);
    if (match) {
      fetchVerse(match);
    } else {
      setVerseText("");
    }
  }, [text]);

  const findReference = (input: string) => {
    const parsed = bcv.parse(input);
    const refs = parsed.osis();
    return refs.length ? refs.split(",").pop() : null;
  };

  const fetchVerse = async (ref: string) => {
    try {
      const res = await axios.get(`${API_BIBLE_BASE}/bibles`, {
        headers: { "api-key": API_BIBLE_KEY },
      });
      const kjv = res.data.data.find(b => b.abbreviationLocal === "KJV");
      if (!kjv) return;

      const passageRes = await axios.get(
        `${API_BIBLE_BASE}/bibles/${kjv.id}/passages/${ref}`,
        {
          headers: { "api-key": API_BIBLE_KEY },
          params: { contentType: "text" },
        }
      );
      const verseHtml = passageRes.data.data.content;
      setVerseText(stripHtml(verseHtml));
    } catch (err) {
      console.log(err);
    }
  };

  const stripHtml = (html: string) => html.replace(/<[^>]+>/g, "");

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Sermon Notes</Text>
      <TextInput
        multiline
        value={text}
        onChangeText={setText}
        placeholder="Type your sermon notes (e.g. John 3:16)..."
        style={styles.input}
      />
      {verseText ? (
        <View style={styles.verseBox}>
          <Text style={styles.verse}>{verseText}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  label: { fontWeight: "bold", fontSize: 18, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    minHeight: 150,
    textAlignVertical: "top",
  },
  verseBox: {
    marginTop: 12,
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
  },
  verse: { fontStyle: "italic" },
});
