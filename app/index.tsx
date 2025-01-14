import React, { useState, useEffect } from 'react';
import { Text, View, Button, Switch } from 'react-native';
import { setKnownWord, isKnownWord } from '@/src/utils/storage';
import list_polish from '../assets/word-lists/polish.json';

export default function Index() {
  const [knownWordsOriginal, setKnownWordsOriginal] = useState<string[]>([]);
  const [knownWordsInverted, setKnownWordsInverted] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [filteredWords, setFilteredWords] = useState<[string, string][]>([]);
  const [invert, setInvert] = useState(false);

  useEffect(() => {
    const fetchKnownWords = async () => {
      const knownWordsPromises = Object.keys(list_polish).map(async (word: string) => {
        const isKnown = await isKnownWord(word);
        return isKnown ? word : null;
      });
      const knownWordsResults = await Promise.all(knownWordsPromises);
      const knownWordsList = knownWordsResults.filter(Boolean) as string[];
      setKnownWordsOriginal(knownWordsList);

      const knownWordsInvertedPromises = Object.values(list_polish).map(async (word: string) => {
        const isKnown = await isKnownWord(word);
        return isKnown ? word : null;
      });
      const knownWordsInvertedResults = await Promise.all(knownWordsInvertedPromises);
      const knownWordsInvertedList = knownWordsInvertedResults.filter(Boolean) as string[];
      setKnownWordsInverted(knownWordsInvertedList);

      const filtered = Object.entries(list_polish).filter(([word, translation]) => 
        !knownWordsList.includes(word) && !knownWordsInvertedList.includes(translation)
      );
      setFilteredWords(filtered);
    };

    fetchKnownWords();
  }, []);

  const handleMarkAsKnown = async (word: string, translation: string) => {
    if (invert) {
      await setKnownWord(translation);
      setKnownWordsInverted([...knownWordsInverted, translation]);
    } else {
      await setKnownWord(word);
      setKnownWordsOriginal([...knownWordsOriginal, word]);
    }
    setFilteredWords(filteredWords.filter(([w]) => w !== word));
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

  const handleToggleInvert = () => {
    setInvert(!invert);
    setShowTranslation(false);
  };

  const currentWord = filteredWords[currentWordIndex];

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

  const [word, translation] = currentWord;

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Switch
        value={invert}
        onValueChange={handleToggleInvert}
      />
      <Text>Invert</Text>
      <Text>{invert ? translation : word}</Text>
      {showTranslation && <Text>{invert ? word : translation}</Text>}
      {!showTranslation && <Button title="Show Translation" onPress={handleShowTranslation} />}
      <Button title="Mark as Known" onPress={() => handleMarkAsKnown(word, translation)} />
      <Button title="Next" onPress={handleNextWord} />
      <Text>Known: {invert ? knownWordsInverted.length : knownWordsOriginal.length}/{Object.keys(list_polish).length}</Text>
    </View>
  );
}