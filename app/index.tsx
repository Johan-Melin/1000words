import React, { useState, useEffect } from 'react';
import { Text, View, Button } from 'react-native';
import { setKnownWord, isKnownWord } from '@/src/utils/storage';
import list_polish from '../assets/word-lists/polish.json';

export default function Index() {
  const [knownWords, setKnownWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);

  useEffect(() => {
    const fetchKnownWords = async () => {
      const knownWordsPromises = Object.keys(list_polish).map(async (polishWord: string) => {
        const isKnown = await isKnownWord(polishWord);
        return isKnown ? polishWord : null;
      });
      const knownWordsResults = await Promise.all(knownWordsPromises);
      setKnownWords(knownWordsResults.filter(Boolean) as string[]);
    };

    fetchKnownWords();
  }, []);

  const handleMarkAsKnown = async (polishWord: string) => {
    await setKnownWord(polishWord);
    setKnownWords([...knownWords, polishWord]);
    setCurrentWordIndex(currentWordIndex + 1);
    setShowTranslation(false);
  };

  const handleNextWord = () => {
    setCurrentWordIndex(currentWordIndex + 1);
    setShowTranslation(false);
  };

  const handleShowTranslation = () => {
    setShowTranslation(true);
  };

  const words = Object.entries(list_polish);
  const currentWord = words[currentWordIndex];

  if (!currentWord) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>No more words to display</Text>
      </View>
    );
  }

  const [polishWord, englishWord] = currentWord;

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>{polishWord}</Text>
      {showTranslation && <Text>{englishWord}</Text>}
      {!showTranslation && <Button title="Show Translation" onPress={handleShowTranslation} />}
      {knownWords.includes(polishWord) ? (
        <Text>Known</Text>
      ) : (
        <Button title="Mark as Known" onPress={() => handleMarkAsKnown(polishWord)} />
      )}
      <Button title="Next" onPress={handleNextWord} />
      <Text>Known: {knownWords.length}/{words.length}</Text>
    </View>
  );
}