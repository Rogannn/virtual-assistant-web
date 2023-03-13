import subprocess
from flask import Flask, render_template, request, jsonify
import random
import json
from keras.models import load_model
import numpy as np
import pickle
from nltk.stem import WordNetLemmatizer
import nltk
import webbrowser
import datetime
# nltk.download('popular')
lemmatizer = WordNetLemmatizer()
# model = load_model('model.h5')
# intents = json.loads(open('intents.json').read())
# words = pickle.load(open('texts.pkl', 'rb'))
# classes = pickle.load(open('labels.pkl', 'rb'))


# def clean_up_sentence(sentence):
#     # tokenize the pattern - split words into array
#     sentence_words = nltk.word_tokenize(sentence)
#     # stem each word - create short form for word
#     sentence_words = [lemmatizer.lemmatize(
#         word.lower()) for word in sentence_words]
#     return sentence_words

# # return bag of words array: 0 or 1 for each word in the bag that exists in the sentence


# def bow(sentence, words, show_details=True):
#     # tokenize the pattern
#     sentence_words = clean_up_sentence(sentence)
#     # bag of words - matrix of N words, vocabulary matrix
#     bag = [0]*len(words)
#     for s in sentence_words:
#         for i, w in enumerate(words):
#             if w == s:
#                 # assign 1 if current word is in the vocabulary position
#                 bag[i] = 1
#                 if show_details:
#                     print("found in bag: %s" % w)
#     return (np.array(bag))


# def predict_class(sentence, model):
#     # filter out predictions below a threshold
#     p = bow(sentence, words, show_details=False)
#     res = model.predict(np.array([p]))[0]
#     ERROR_THRESHOLD = 0.25
#     results = [[i, r] for i, r in enumerate(res) if r > ERROR_THRESHOLD]
#     # sort by strength of probability
#     results.sort(key=lambda x: x[1], reverse=True)
#     return_list = []
#     for r in results:
#         return_list.append({"intent": classes[r[0]], "probability": str(r[1])})
#     return return_list


# def getResponse(ints, intents_json):
#     tag = ints[0]['intent']
#     list_of_intents = intents_json['intents']
#     for i in list_of_intents:
#         if (i['tag'] == tag):
#             result = random.choice(i['responses'])
#             break
#     return result


# def chatbot_response(msg):
#     ints = predict_class(msg, model)
#     res = getResponse(ints, intents)
#     return res

model = load_model('model.h5')
intents_file_path = 'static/scripts/intents.json'
categories_file_path = 'static/scripts/categorical_queries.json'
categorical_queries = json.loads(open(categories_file_path).read())
intents = json.loads(open(intents_file_path).read())
words = pickle.load(open('texts.pkl', 'rb'))
classes = pickle.load(open('labels.pkl', 'rb'))

# Define context dictionary
context = {}


def clean_up_sentence(sentence):
    # tokenize the pattern - split words into array
    sentence_words = nltk.word_tokenize(sentence)
    # stem each word - create short form for word
    sentence_words = [lemmatizer.lemmatize(
        word.lower()) for word in sentence_words]
    return sentence_words

# return bag of words array: 0 or 1 for each word in the bag that exists in the sentence


def bow(sentence, words, show_details=True):
    # tokenize the pattern
    sentence_words = clean_up_sentence(sentence)
    # bag of words - matrix of N words, vocabulary matrix
    bag = [0]*len(words)
    for s in sentence_words:
        for i, w in enumerate(words):
            if w == s:
                # assign 1 if current word is in the vocabulary position
                bag[i] = 1
                if show_details:
                    print("found in bag: %s" % w)
    return (np.array(bag))


def predict_class(sentence):
    # filter out predictions below a threshold
    p = bow(sentence, words, show_details=False)
    res = model.predict(np.array([p]))[0]
    ERROR_THRESHOLD = 0.25
    results = [[i, r] for i, r in enumerate(res) if r > ERROR_THRESHOLD]
    # sort by strength of probability
    results.sort(key=lambda x: x[1], reverse=True)
    return_list = []
    for r in results:
        return_list.append({"intent": classes[r[0]], "probability": str(r[1])})
    return return_list


last_speech = ""


def getResponse(ints, intents_json):
    try:
        tag = ints[0]['intent']
    except IndexError:
        result = "I'm sorry, it seems that your question is not on my database."
        return result
    list_of_intents = intents_json['intents']
    for i in list_of_intents:
        if (i['tag'] == tag):
            result = random.choice(i['responses'])
            break
    return result


def chatbot_response(msg):
    global context
    ints = predict_class(msg)
    try:
        res = getResponse(ints, intents)
        global last_speech
        last_speech = res
        print(f"Last speech: {last_speech}")

        if ints[0]["intent"] == "replay":
            res = last_speech
            return res

        if ints[0]["intent"] == "time_check":
            time = datetime.datetime.now().strftime('%I:%M %p')
            res = f"It's {time}"
            return res

        if ints[0]["intent"] == "current_date":
            date = datetime.datetime.now().strftime('%B %d, %Y')
            res = f"Today is {date}"
            return res

        if ints[0]["intent"] == "goodbye":
            context.clear()

        if ints[0]["intent"] == "get_name":
            context["name"] = msg

        if ints[0]["intent"] == "get_city":
            context["city"] = msg

        if ints[0]["intent"] == "get_schedule":
            context["schedule"] = msg

        if ints[0]["intent"] == "open_portal":
            webbrowser.open("https://sms.dhvsu.edu.ph/auth/login")

        if ints[0]["intent"] == "get_weather":
            if "name" in context and "city" in context:
                res = f"The weather in {context['city']} is sunny today, {context['name']}."
            else:
                res = "Please provide your name and city first."
    except IndexError:
        res = "I'm sorry, it seems that your question is not on my database yet."
        return res
    add_to_logs(f"User: {msg}")
    add_to_logs(f"Bot: {res}")
    return str(res)


def add_to_logs(message):
    date = datetime.datetime.now().strftime('%B %d, %Y')
    time = datetime.datetime.now().strftime('%I:%M %p')
    with open('static/scripts/logs.txt', 'r+') as file:
        content = file.read()
        file.seek(0, 0)
        file.write(f"[{date}: {time}]: {message}\n{content}")


# Create Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret_key'
app.static_folder = 'static'


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/get")
def get_bot_response():
    userText = request.args.get('msg')
    print(userText)
    return chatbot_response(userText)


@app.route("/admin")
def admin():
    return render_template("admin.html")


@app.route('/update-categories-json', methods=['POST'])
def update_categories_json():
    try:
        data = request.get_json()
        with open('static/scripts/categorical_queries.json', 'w') as f:
            json.dump(data, f, indent=4)
        add_to_logs(f"[ADMIN] Categories raw file updated.")
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})


@app.route('/update-intents-json', methods=['POST'])
def update_intents_json():
    try:
        data = request.get_json()
        with open('static/scripts/intents.json', 'w') as f:
            json.dump(data, f, indent=4)
        add_to_logs(f"[ADMIN] Intents raw file updated.")
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})


def reload_files():
    global intents, words, classes, model
    model = load_model('model.h5')
    intents = json.loads(open('static/scripts/intents.json').read())
    words = pickle.load(open('texts.pkl', 'rb'))
    classes = pickle.load(open('labels.pkl', 'rb'))


@app.route('/start_training')
def start_training():
    try:
        cmd = ['python', 'training2.py']
        result = subprocess.run(cmd, capture_output=True)
        print(f"{str(result.stdout)}\n")
        print(f"{str(result.stderr)}\n")
        if result.returncode == 0:
            output = result.stdout.decode('utf-8')
            add_to_logs(f"[ADMIN] Training successfully.")
            reload_files()
            return jsonify({'success': True, 'output': str(output)})
        else:
            error = result.stderr.decode('utf-8')
            add_to_logs(f"[ADMIN] Training error: {error}")
            return jsonify({'success': False, 'error': str(error)})
    except subprocess.CalledProcessError as e:
        return jsonify({'success': False, 'error': e.output.decode('utf-8')})


@app.route("/add_intent", methods=['POST'])
def add_new_intent():
    try:
        reload_files()
        data = request.get_json()
        tag = data.get('tag')
        patterns = data.get('patterns')
        responses = data.get('responses')

        # Load the existing content of the JSON file
        with open(intents_file_path, 'r') as f:
            intents = json.load(f)['intents']

        # Add the new intent to the existing list of intents
        new_intent = {'tag': tag, 'patterns': [
            patterns], 'responses': [responses]}
        intents.append(new_intent)

        # Write the modified content back to the JSON file
        with open(intents_file_path, 'w') as f:
            json.dump({'intents': intents}, f, indent=4)

        print(data)
        reload_files()
        add_to_logs(
            f"[ADMIN] Added new Intent in intents.json: \nTag: {tag}\nPatterns: {patterns}\nResponses: {responses}")
        return jsonify({'success': True})
    except Exception as e:
        add_to_logs(f"[ADMIN] Error: Failed to add the new intent\n{e}")
        return jsonify({'success': False, 'error': e})


@app.route("/edit_category", methods=['POST'])
def edit_category():
    try:
        reload_files()
        data = request.get_json()
        category = data.get("category")
        old_queries = categorical_queries[str(data.get("category"))]
        categorical_queries[str(data.get("category"))] = data.get("queries")
        new_queries = categorical_queries[str(data.get("category"))]
        with open(categories_file_path, "w") as file:
            json.dump(categorical_queries, file, indent=4)
        add_to_logs(
            f"[ADMIN] Edited Category {category}: \nOld:\n{old_queries}\nNew:\n{new_queries}")
        return jsonify({'success': True})
    except Exception as e:
        add_to_logs(f"[ADMIN] Failed to edit Category {category}:\n{e}")
        return jsonify({'success': False})


@app.route("/add_query_category", methods=['POST'])
def add_query_category():
    try:
        reload_files()
        data = request.get_json()
        category = data.get("category")
        queries = data.get("queries")
        categorical_queries[str(category)].append(queries)
        with open(categories_file_path, "w") as file:
            json.dump(categorical_queries, file, indent=4)
        add_to_logs(
            f"[ADMIN] Successfully added query \"{queries}\" in Category {category}")
        return jsonify({'success': True})
    except Exception as e:
        add_to_logs(f"[ADMIN] Failed to add query: {e}")
        return jsonify({'success': False})


@app.route("/delete_query_category", methods=['POST'])
def delete_query_category():
    try:
        reload_files()
        data = request.get_json()
        category = data.get("category")
        key = data.get("key")
        old_data = categorical_queries[str(category)][key]
        categorical_queries[str(category)].pop(key)
        with open(categories_file_path, "w") as file:
            json.dump(categorical_queries, file, indent=4)
        add_to_logs(
            f"[ADMIN] Successfully deleted query: \"{old_data}\" in Category {category}")
        return jsonify({'success': True})
    except Exception as e:
        add_to_logs(f"[ADMIN] Tried to delete the query: \n{e} ")
        return jsonify({'success': False})


@app.route("/edit_intent", methods=['POST'])
def edit_intent():
    try:
        reload_files()
        data = request.get_json()
        id = data.get("id")
        tag = data.get("tag")
        patterns = data.get("patterns")
        responses = data.get("responses")
        intents["intents"][id]["tag"] = tag
        intents["intents"][id]["patterns"] = patterns
        intents["intents"][id]["responses"] = responses
        new_data = intents["intents"][id]
        with open(intents_file_path, "w") as file:
            json.dump(intents, file, indent=4)
        add_to_logs(
            f"[ADMIN] Edited Intent: \nOld:\n{data}\nNew:\n{new_data}")
        return jsonify({'success': True})
    except Exception as e:
        add_to_logs(f"[ADMIN] Failed to edit intent: \n{e}")
        return jsonify({'success': False})


@app.route("/delete_intent", methods=['POST'])
def delete_intent():
    try:
        reload_files()
        data = request.get_json()
        deleted_intent = intents["intents"][data.get("index")]
        intents["intents"].pop(data.get("index"))
        with open(intents_file_path, "w") as file:
            json.dump(intents, file, indent=4)
        add_to_logs(f"[ADMIN] Deleted intent: {deleted_intent}")
        return jsonify({'success': True})
    except Exception as e:
        add_to_logs(
            f"[ADMIN] Error, failed to delete the intent: \n{delete_intent}\nError: {e}")
        return jsonify({'success': False, 'error': e})


# listening = False
# running = False


# @app.route('/speech-to-text', methods=['POST'])
# def speech_to_text():
#     audio = request.form["audio"]
#     # listening = request.get_json('listen')
#     # print(listening['listen'])
#     global listening
#     print(f"[SERVER] Listening: {listening}")
#     if listening:
#         r = sr.Recognizer()
#         with sr.Microphone() as source:
#             r.adjust_for_ambient_noise(source)
#             audio = r.listen(source)
#             print("Analyzing speech...")
#         try:
#             text = r.recognize_google(audio)
#             print(f"You said: {text}")
#             print(f"Bot: {chatbot_response(text)}")
#             r = sr.Recognizer()
#             return jsonify({'text': text, 'bot_response': chatbot_response(text)})
#         except sr.UnknownValueError:
#             print("Oops! Didn't catch that")
#             r = sr.Recognizer()
#             return jsonify({'error': True, 'error_text': 'Speech recognition engaged. Please speak clearly into the microphone.'})
#         except sr.RequestError as e:
#             r = sr.Recognizer()
#             print(
#                 f"Could not request results from Google Speech Recognition service; {e}")
#             return jsonify({'error': True, 'error_text': "There's an issue with the system that converts your voice into text, please try again later."})
#     return jsonify({"listen": listening})


# @app.route('/speech-to-text', methods=['POST'])
# def speech_to_text():
#     r = sr.Recognizer()
#     audio = request.files["audio"]
#     print(f"AAAAAAAAAAAAAAAAAAAAAAAAAAA: {audio}")
#     with sr.AudioFile(audio) as source:
#         audio_data = r.record(source)
#         try:
#             text = r.recognize_google(audio_data)
#             print(f"You said: {text}")
#             print(f"Bot: {chatbot_response(text)}")
#             r = sr.Recognizer()
#             return jsonify({'text': text, 'bot_response': chatbot_response(text)})
#         except sr.UnknownValueError:
#             print("Oops! Didn't catch that")
#             r = sr.Recognizer()
#             return jsonify({'error': True, 'error_text': 'Speech recognition engaged. Please speak clearly into the microphone.'})
#         except sr.RequestError as e:
#             r = sr.Recognizer()
#             print(
#                 f"Could not request results from Google Speech Recognition service; {e}")
#             return jsonify({'error': True, 'error_text': "There's an issue with the system that converts your voice into text, please try again later."})
#         except Exception as e:
#             r = sr.Recognizer()
#             print(f"[SERVER] Error: {e}")
#             return jsonify({'error': True, 'error_text': e})


# @ app.route('/start-stt', methods=['POST'])
# def start_speech_recognition():
#     jsdata = request.get_json('listen')
#     global listening
#     listening = jsdata['listen']
#     print(jsdata)
#     return jsonify({"listen": listening})

# @app.route('/speech-to-text', methods=['POST'])
# def speech_to_text():
#     jsdata = request.get_json('listen')
#     print(jsdata['listen'])
#     global running
#     if jsdata['listen'] and not running:
#         running = True
#         r = sr.Recognizer()
#         while running:
#             with sr.Microphone() as source:
#                 r.adjust_for_ambient_noise(source)
#                 audio = r.listen(source)
#             print("Analyzing speech...")
#             try:
#                 text = r.recognize_google(audio)
#                 print(f"You said: {text}")
#                 print(f"Bot: {chatbot_response(text)}")
#                 r = sr.Recognizer()
#                 return jsonify({'text': text, 'bot_response': chatbot_response(text)})
#             except sr.UnknownValueError:
#                 print("Oops! Didn't catch that")
#                 r = sr.Recognizer()
#                 return jsonify({'error': True})
#             except sr.RequestError as e:
#                 r = sr.Recognizer()
#                 print(
#                     f"Could not request results from Google Speech Recognition service; {e}")
#                 return jsonify({'error': True})
#     elif not jsdata["listen"] and running:
#         running = False
#     return jsonify({'listen': running})


# def listen():
#     r = sr.Recognizer()
#     global listening
#     listening = True
#     print("[SERVER]: Recognition started.")
#     while listening:
#         with sr.Microphone() as source:
#             print("Say something..")
#             try:
#                 audio = r.listen(source)
#                 text = r.recognize_google(audio)
#                 send_recognized_speech(text)
#                 send_response(text)
#             except sr.UnknownValueError:
#                 print("Oops! Didn't catch that")
#                 r = sr.Recognizer()
#             except sr.RequestError as e:
#                 print(
#                     f"Could not request results from Google Speech Recognition service; {e}")
#                 r = sr.Recognizer()
#             except sr.WaitTimeoutError as e:
#                 print(f"Error: {e}")
#                 r = sr.Recognizer()
#             # except Exception as e:
#             #     print(f"Error: {e}")
#             #     print(traceback.format_exc())
#             #     r = sr.Recognizer()
#             if not listening:
#                 break


# def send_recognized_speech(text):
#     print(f"You said: {text}")
#     socketio.emit('recognized speech', {
#         'text': text}, broadcast=True)


# def send_response(text):
#     bot_response = chatbot_response(text)
#     print(f"Bot response: {bot_response}")
#     socketio.emit('bot response', {
#         'text': bot_response})


# thread = None


# @socketio.on('stop recognition')
# def stop_recognition(data):
#     print("[SERVER]: Recognition stopped.")
#     global thread
#     global listening
#     thread = None
#     listening = False
# @socketio.on('start recognition')
# def start_recognition(data):
#     global thread
#     if thread is None:
#         socketio.emit('recognition started', {
#             'text': 'recognition started'}, broadcast=True)
#         thread = socketio.start_background_task(listen)
if __name__ == '__main__':
    # socketio.run(app, host="127.0.0.1", port=5050)
    app.run(host="127.0.0.1", port=5050)
