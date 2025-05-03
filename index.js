const inputEl = document.getElementById("input");
const infoTextEl = document.getElementById("info-text");
const meaningContainerEl = document.getElementById("meaning-container");
const titleEl = document.getElementById("title");
const meaningEl = document.getElementById("meaning");
const audioEl = document.getElementById("audio");
const vocabularyListBtn = document.getElementById("vocabulary-list-btn");
const addToListBtn = document.getElementById("add-to-list-btn");

let vocabularyList = [];
const dbPromise = window.indexedDB.open("VocabularyDB", 1);

dbPromise.onupgradeneeded = function(event){
    const db = event.target.result;
    const vocabularyStore = db.createObjectStore("vocabulary", {
        keyPath:"word",
    });
};

function showVocabularyList(){
    const listContainer = document.createElement("div");
    listContainer.classList.add("vocabulary-list-container");
    listContainer.innerHTML = "<h2>Vocabulary List<h2>";

    const dbPromise = window.indexedDB.open("VocabularyDB", 1);

    dbPromise.onsuccess = function(event){
        const db = event.target.result;
        const transaction = db.transaction("vocabulary", "readonly");
        const vocabularyStore = transaction.objectStore("vocabulary");

        const request = vocabularyStore.openCursor();

        request.onsuccess = function(event){
            const cursor = event.target.result;
            if (cursor){
                const wordData = cursor.value;
                const listItem = document.createElement("li");

                listItem.innerHTML=`
                    <strong>${wordData.word}:</strong>
                    <em>${wordData.meaning}</em>
                    `;
                listContainer.appendChild(listItem);

                const horizontalRule = document.createElement("hr");
                horizontalRule.classList.add("separator");
                listContainer.appendChild(horizontalRule);
                cursor.continue();
            }
        };
    };

    const existingListContainer = document.querySelector(".vocabulary-list-container");
    if (existingListContainer){
        existingListContainer.remove();
    }

    document.body.appendChild(listContainer);
}

function addToVocabularyList(word, meaning, audioSrc){
    const dbPromise = window.indexedDB.open("VocabularyDB", 1);
    dbPromise.onsuccess = function(event){
        const db = event.target.result;
        const transaction = db.transaction("vocabulary", "readwrite");
        const vocabularyStore = transaction.objectStore("vocabulary");
    
        const wordData = {
            word, 
            meaning, 
            audio: audioSrc,
        };
        const request = vocabularyStore.add(wordData);

        request.onsuccess = function(){
            alert(`${word} added to vocabulary list!`);
        };

        request.onerror = function(){
            console.error("Error adding word to vocabulary list.");
        };
    };
}

async function fetchAPI(word){
    try {
        infoTextEl.style.display = "block";
        meaningContainerEl.style.display = "none";

        infoTextEl.innerText = `Seaching the meaning of "${word}"...`
        const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
        const result = await fetch(url).then((res)=>res.json());

        if(result.title){
            meaningContainerEl.style.display = "block";
            infoTextEl.style.display = "none";
            titleEl.innerText = word;
            meaningEl.innerText = "N/A";
            audioEl.style.display = "none";
            vocabularyListBtn.style.display = "block";
            addToListBtn.style.display = "none";
        }else{
            infoTextEl.style.display = "none";
            meaningContainerEl.style.display = "block";
            audioEl.style.display = "inline-flex";
            titleEl.innerText = result[0].word;
            meaningEl.innerText = result[0].meanings[0].definitions[0].definition;
            audioEl.src = result[0].phonetics[0].audio;

            vocabularyListBtn.style.display = "block";
            addToListBtn.style.display = "block";

            addToListBtn.addEventListener("click", function(){
                addToVocabularyList(result[0].word, meaningEl.innerText, audioEl.src);
                showVocabularyList();
            });
        }
    } catch (error) {
        console.log(error);
        infoTextEl.innerText = `an error happened, try again later`;
    }
    
}

inputEl.addEventListener("keyup", (e)=>{
    if(e.target.value && e.key === "Enter"){
        fetchAPI(e.target.value)
    }
});
vocabularyListBtn.addEventListener("click", showVocabularyList);