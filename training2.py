import random
import json
import nltk
import numpy as np
import pickle
import tensorflow as tf
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import Sequential
from nltk.stem import WordNetLemmatizer

# set random seed for reproducibility
np.random.seed(42)

# load the intents file and get the context (if any)
data_file = open('static/scripts/intents.json').read()
intents = json.loads(data_file)
context = intents.get('context', None)

# initialize the lemmatizer
lemmatizer = WordNetLemmatizer()

# collect all words and classes
words = []
classes = []
documents = []
ignore_words = ['?', '!', ',', '.', "@"]
for intent in intents['intents']:
    for pattern in intent['patterns']:
        w = nltk.word_tokenize(pattern)
        words.extend(w)
        documents.append((w, intent['tag']))
        if intent['tag'] not in classes:
            classes.append(intent['tag'])

# lemmatize and remove duplicates
words = list(set([lemmatizer.lemmatize(w.lower())
             for w in words if w not in ignore_words]))
classes = list(set(classes))

# save the words and classes to disk
pickle.dump(words, open('texts.pkl', 'wb'))
pickle.dump(classes, open('labels.pkl', 'wb'))

# create the training data
training = []
output_empty = [0] * len(classes)
for doc in documents:
    bag = []
    pattern_words = doc[0]
    pattern_words = [lemmatizer.lemmatize(
        word.lower()) for word in pattern_words]
    for w in words:
        bag.append(1) if w in pattern_words else bag.append(0)

    output_row = list(output_empty)
    output_row[classes.index(doc[1])] = 1

    training.append([bag, output_row])
random.shuffle(training)
training = np.array(training)
train_x = list(training[:, 0])
train_y = list(training[:, 1])

# initialize the model
model = Sequential()
model.add(Dense(128, input_shape=(len(train_x[0]),), activation='relu'))
model.add(Dropout(0.5))
model.add(Dense(64, activation='relu'))
model.add(Dropout(0.5))
model.add(Dense(len(train_y[0]), activation='softmax'))

# compile the model
adam = Adam(learning_rate=0.01)
model.compile(loss='categorical_crossentropy',
              optimizer=adam, metrics=['accuracy'])

# train the model
model.fit(np.array(train_x), np.array(train_y),
          epochs=200, batch_size=5, verbose=1)

# save the model to disk
model.save('model.h5')

# print some useful information
print(
    f'Training data created: {len(documents)} documents, {len(classes)} classes, {len(words)} unique lemmatized words')
print(f'Model saved to disk')

result = "Training completed."
print(result)
