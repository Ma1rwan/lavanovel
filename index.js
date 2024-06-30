// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC1JcDe3AEgSsBNsu3CYXheVJJbWaFYOfU",
    authDomain: "lavanovelapi.firebaseapp.com",
    databaseURL: "https://lavanovelapi-default-rtdb.firebaseio.com",
    projectId: "lavanovelapi",
    storageBucket: "lavanovelapi.appspot.com",
    messagingSenderId: "584919572619",
    appId: "1:584919572619:web:9a72872956331ccb00348e",
    measurementId: "G-XQYTPYDRG0"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Function to fetch file content from Firebase Storage
async function fetchFileContent(filePath) {
  try {
      const fileRef = ref(storage, filePath);
      const url = await getDownloadURL(fileRef);
      const response = await fetch(url);
      if (!response.ok) {
      }
      return await response.json();
  } catch (error) {
  }
}




async function fetchSearchFile(query) {
    let matched_titles = [];
    let matched_arabic_titles = [];
    let matched_images = [];
    try {
        const novelName = query.replaceAll("-", " ");

        const searchTerms = novelName.split(" ");
        searchTerms.forEach((searchTerm, index) =>{
            searchTerms[index] = searchTerm.toLowerCase();
        });
       



        const arabicPattern = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\s,.'"!?]+$/;
        const isArabic = arabicPattern.test(novelName);
        const englishPattern = /^[a-zA-Z\s,.'"!?]+$/;
        const isEnglish = englishPattern.test(novelName);


        if (isArabic || isEnglish) {
            const fileRef = ref(storage, "search/novelsinfo.json");
            const url = await getDownloadURL(fileRef);
            const response = await fetch(url);
            let novels_list = [];
            if (response.ok) {
                const data = await response.json();
                const english_titles = data.english_titles;
                const arabic_titles = data.arabic_titles;
                const images = data.images;
                
                if (isArabic) {
                    novels_list = arabic_titles;
                }else{
                    novels_list = english_titles;
                }
                for (let index = 0; index < novels_list.length; index++) {
                    const title_lower = novels_list[index].toLowerCase();
                    const allPresent = searchTerms.every(searchTerm => title_lower.includes(searchTerm));
                    if (allPresent) {
                        matched_titles.push(english_titles[index]);
                        matched_arabic_titles.push(arabic_titles[index]);
                        matched_images.push(images[index]);
                    }
                }
                
            }



        }else{
            console.error("Not a valid input.");
        }
        const result = {
            'english_titles': matched_titles,
            'arabic_titles': matched_arabic_titles,
            'images': matched_images
        };
        
        
        return result;



        
    
    } catch (error) {
        console.error(error);
        const result = {
            'english_titles': matched_titles,
            'arabic_titles': matched_arabic_titles,
            'images': matched_images
        };
        
        
        return result;
    }
  }

// index.js

// Function to load content based on hash fragment
function loadContent() {
    const hash = window.location.hash.slice(1); // Get hash without the '#'

    // Define mapping of routes to functions
    const routeMapping = {
        '/': () => home(),
        '/privacy': () => privacy(),
        '': () => home()

    };
    window.scrollTo(0, 0);

    // Check if the hash has a corresponding route in routeMapping
    if (routeMapping[hash]) {
        // Call the function associated with the route
        routeMapping[hash]();
    } else if (hash.startsWith('/novel/')) {
        // Split the hash into parts
        const parts = hash.split('/');
        // Ensure we have at least "/hello/name"
        if (parts.length === 3 && parts[0] === '' && parts[1] === 'novel' && parts[2] !== '') {
            const novel = parts[2];

            // Display dynamic content based on name only
            fetchAndSetContent('novel.html');

            setNovel(novel);
        } else if (parts.length === 4 && parts[0] === '' && parts[1] === 'novel' && parts[3] !== '') {
            const novel = parts[2];
            const chapter = parts[3];

            // Display dynamic content based on name and age
            fetchAndSetContent('chapter.html');
            setChapter(novel, chapter);
        } else {
            notFound();
        }
    } else if (hash.startsWith('/library') && hash.split("/").length <= 3) {
        let page; // Declare page variable outside if-else blocks to be accessible later
        
        if (hash.split("/").length === 2) {
            page = 1;
        } else if (hash.split("/").length === 3) {
            page = hash.split("/")[2]; // Accessing the third element in the array
        }
        library(Number(page));
        
    }
    else {
        notFound();
    }
    const toggleButton = document.getElementById("toggleButton");
    toggleButton.addEventListener('click', theme);
}

// Function to fetch and set HTML content for Home page
async function home() {
    fetchAndSetContent('home.html');
    const styleFile = "style.css"
    const stylesheet = document.getElementById("stylesheet");
    stylesheet.href = styleFile;

      try {

          // Fetch data from Firebase
          const data = await fetchFileContent('main/index.json');
          const arabicTitles = data.arabic_titles;
          const englishTitles = data.english_titles;
          const images = data.images;
          const dateReleased = data.date_released;
          const lastChapterNames = data.last_chapter_names;
          const lastChapterNumbers = data.last_chapter_numbers;

          // Select containers to append novel cards
          const first7header = document.getElementById("first7header");
          const second7header = document.getElementById("second7header");
          const thirdHeader = document.getElementById("thirdHeader");
          const forth7header = document.getElementById("forth7header");
          const fifth7header = document.getElementById("fifth7header");

          // Loop through the data and create novel cards
          for (let i = 0; i < arabicTitles.length; i++) {
              const novelCard = document.createElement('div');

              // Append novel card to appropriate container based on index
              if (i < 24) {
                  novelCard.classList.add('read_card2');
                  novelCard.innerHTML = `
                      <a class="recently_added" href="#/novel/${englishTitles[i]}/${lastChapterNumbers[i]}">
                          <p class="read_card2_title">${arabicTitles[i]}</p>
                          <div class="themetext">
                              <p class="read_card2_last_chapter">${lastChapterNames[i]}</p>
                              <p class="read_card2_time">${dateReleased[i]}</p>
                          </div>
                          <img src="${images[i]}" alt="">
                      </a>
                  `;
                  thirdHeader.appendChild(novelCard);
              } else if (i < (24 + 7)) {
                  novelCard.classList.add('read_card');
                  novelCard.innerHTML = `
                      <a class="most_famouse1" href="#/novel/${englishTitles[i]}">
                          <img src="${images[i]}" alt="${englishTitles[i]}">
                          <div class="h2space">
                              <h2>${arabicTitles[i]}</h2>
                          </div>
                      </a>
                  `;
                  first7header.appendChild(novelCard);
              } else if (i < (24 + 7 + 7)) {
                  novelCard.classList.add('read_card');
                  novelCard.innerHTML = `
                      <a class="most_famouse2" href="#/novel/${englishTitles[i]}">
                          <img src="${images[i]}" alt="${englishTitles[i]}">
                          <h2>${arabicTitles[i]}</h2>
                      </a>
                  `;
                  second7header.appendChild(novelCard);
              } else if (i < (24 + 7 + 7 + 7)) {
                  novelCard.classList.add('read_card');
                  novelCard.innerHTML = `
                      <a class="famouse_continue" href="#/novel/${englishTitles[i]}">
                          <img src="${images[i]}" alt="${englishTitles[i]}">
                          <h2>${arabicTitles[i]}</h2>
                      </a>
                  `;
                  forth7header.appendChild(novelCard);
              } else if (i < (24 + 7 + 7 + 7 + 7)) {
                  novelCard.classList.add('read_card');
                  novelCard.innerHTML = `
                      <a class="most_famouse1" href="#/novel/${englishTitles[i]}">
                          <img src="${images[i]}" alt="${englishTitles[i]}">
                          <h2>${arabicTitles[i]}</h2>
                      </a>
                  `;
                  fifth7header.appendChild(novelCard);
              }
          }
      } catch (error) {
          console.error('Error in homePage:', error);
          notFound();
      }
      themeOnStart();

}

// Function to fetch and set HTML content for About page
async function library(page) {
    const styleFile = "library.css"
    const stylesheet = document.getElementById("stylesheet");
    stylesheet.href = styleFile;
    fetchAndSetContent('library.html');

    try {

        // Fetch data from Firebase
        const library_data = await fetchFileContent(`search/novelsinfo.json`);
        if (library_data) {
            const arabic_titles = library_data.arabic_titles;
            const english_titles = library_data.english_titles;
            const genres = library_data.genres;
            const images = library_data.images;
            const total_pages = Math.ceil(english_titles.length / 21);
            if (page < 1){
                console,log("error");
                notFound();
            }else{
                const startIndex = (page - 1) * 21;
                const endIndex = Math.min(page * 21, english_titles.length);

                const nextSignPage = page + 1 <= total_pages ? page + 1 : null;
                const nextNumberPage = page + 1 < total_pages ? page+1 : null;
                const firstPage = page !== 1? 1 : null;
                const prevNumberPage = page - 1 > 1 ? page - 1 : null;
                const prevSignPage = page - 1 >= 1 ? page - 1 : null;
                const lastPage = page !== total_pages? total_pages: null ;

                const nextskipcontainer = document.getElementById("nextskipcontainer");
                let nextsignHTML;
                let nextNumberHTML;
                let lastHTML;
                let currentNumberHTML;
                let prevNumberHTML;
                let firstHTML;
                let prevsignHTML;
                // Next page link
                if (nextSignPage) {
                    nextsignHTML = document.createElement('a');
                    nextsignHTML.textContent = "<";
                    nextsignHTML.classList.add('abtn');
                    nextsignHTML.setAttribute("href", `#/library/${nextNumberPage}`);
                    
                }else{
                    nextsignHTML = document.createElement('a');
                    nextsignHTML.textContent = "<";
                    nextsignHTML.classList.add('abtn');
                    nextsignHTML.setAttribute("href", `#/library/${page}`);
                }
                if (nextNumberPage) {
                    nextNumberHTML = document.createElement('a');
                    nextNumberHTML.textContent = nextNumberPage;
                    nextNumberHTML.classList.add('abtn');
                    nextNumberHTML.setAttribute("href", `#/library/${nextNumberPage}`);
                }

                // First page link
                if (firstPage) {
                    firstHTML = document.createElement('a');
                    firstHTML.textContent = "1";
                    firstHTML.classList.add('abtn');
                    firstHTML.setAttribute("href", `#/library/1`);
                }

                // Previous page link
                if (prevSignPage) {
                    prevsignHTML = document.createElement('a');
                    prevsignHTML.textContent =  ">";
                    prevsignHTML.classList.add('abtn');
                    prevsignHTML.setAttribute("href", `#/library/${prevNumberPage}`);
                }else{
                    prevsignHTML = document.createElement('a');
                    prevsignHTML.textContent = ">";
                    prevsignHTML.classList.add('abtn');
                    prevsignHTML.setAttribute("href", `#/library/${page}`);
                }
                if (prevNumberPage) {
                    prevNumberHTML = document.createElement('a');
                    prevNumberHTML.textContent = prevNumberPage;
                    prevNumberHTML.classList.add('abtn');
                    prevNumberHTML.setAttribute("href", `#/library/${prevNumberPage}`);

                }

                // Current page link
                currentNumberHTML = document.createElement('a');
                currentNumberHTML.textContent = page;
                currentNumberHTML.classList.add('abtn');
                currentNumberHTML.setAttribute("href", `#/library/${page}`);

                // Last page link
                if (lastPage) {
                    lastHTML = document.createElement('a');
                    lastHTML.textContent = total_pages;
                    lastHTML.classList.add('abtn');
                    lastHTML.setAttribute("href", `#/library/${total_pages}`);
                }
                nextsignHTML && nextskipcontainer.appendChild(nextsignHTML);
                lastHTML && nextskipcontainer.appendChild(lastHTML);
                nextNumberHTML && nextskipcontainer.appendChild(nextNumberHTML);
                currentNumberHTML && nextskipcontainer.appendChild(currentNumberHTML);
                prevNumberHTML && nextskipcontainer.appendChild(prevNumberHTML);
                firstHTML && nextskipcontainer.appendChild(firstHTML);
                prevsignHTML && nextskipcontainer.appendChild(prevsignHTML);
                const section2 = document.getElementById("section2");
                for (let index = startIndex; index < endIndex; index++) {
                    const novel_card = document.createElement("div");
                    novel_card.classList.add("read_card2");
                    novel_card.innerHTML = `                <a href="#/novel/${english_titles[index]}">
                                                                <p class="read_card2_title">${arabic_titles[index]}</p>
                                                                <div class="grouptype" id="grouptype${index}">
                                                                </div>
                                                                <img src="${images[index]}" alt="">
                                                            </a>`
                    section2.appendChild(novel_card);
                    const groupTypeDiv = document.getElementById(`grouptype${index}`);
                    const currentGenres = genres[index];
                    for (let jendix = 0; jendix < currentGenres.length; jendix++) {
                        const genre = currentGenres[jendix];
                        const typeSpan =  document.createElement("span");
                        typeSpan.textContent = genre;
                        groupTypeDiv.appendChild(typeSpan);
                        
                    }

                }












            }
            

            
                
        }else{
            notFound();
        }
        

        }catch (error) {
            notFound();
            console.error(error);
        }
        themeOnStart();



}

// Function to fetch and set HTML content for Contact page
function privacy() {
    const styleFile = "novel&chap.css"
    const stylesheet = document.getElementById("stylesheet");
    stylesheet.href = styleFile;
    fetchAndSetContent('privacy.html');
    themeOnStart();

}
function notFound() {
    const styleFile = "404.css"
    const stylesheet = document.getElementById("stylesheet");
    stylesheet.href = styleFile;
    const error = new Error("Page not found.")
    console.error(error);
    fetchAndSetContent('404.html');
    themeOnStart();

}

// Function to fetch and set HTML content for Hello page with name only
async function setNovel(novel) {
    const styleFile = "novel&chap.css"
    const stylesheet = document.getElementById("stylesheet");
    stylesheet.href = styleFile;
   
    try {

        // Fetch data from Firebase
        const data = await fetchFileContent(`novels/${novel}.json`);
        if (data) {
            const english_title = data.english_title;
            const arabic_Title = data.arabic_title;
            const image = data.image;
            const description = data.description;
            const genres = data.genres;
            const chapters = data.chapters;

            // Select containers to append novel cards
            const headerContainer = document.getElementById("header-container");

            headerContainer.innerHTML = `<div class="info-container">
                
                
                <h1 class="noveltitle">${arabic_Title}</h1>

                
                <div class="grouptype" id="grouptype">

                </div>
                <div class="description">
                    <p class="themetext">${description}</p>
                </div>
            </div>

            <div class="img-container">
                <img src="${image}" alt="${english_title}">
            </div>
            `
            const grouptype = document.getElementById("grouptype");
            const chaptersDiv = document.getElementById("chapters");
            for (let index = 0; index < genres.length; index++) {
                const genre = genres[index];
                const type = document.createElement("span");
                type.textContent = genre;
                grouptype.appendChild(type);
                
            }
            for (let index = 0; index < Object.keys(chapters).length; index++) {
            
                const chapterNumber = Object.keys(chapters)[index];
                const chapterTime = chapters[chapterNumber][0];
                const chapterName = chapters[chapterNumber][1];
                
                const chapterDiv = document.createElement("div");
                chapterDiv.classList.add('chapter')
                chapterDiv.innerHTML = `<a href="#/novel/${english_title}/${chapterNumber}" class="themetext">
                <span class="chapter-time">${chapterTime}</span>
                <span class="chapter-name">${chapterName}</span>
                <span class="chapter-number">${chapterNumber}</span>
                </a>`
                chaptersDiv.appendChild(chapterDiv);
               

                
            }
            const updown = document.getElementById("updown");
            updown.addEventListener('click', console.log(":"));
        
        }else{
            notFound();
        }
        
        }catch (error) {
            console.error(error);
            notFound();
        }
        themeOnStart();
        const upDown = document.getElementById("updown");
        updown.addEventListener('click', rearrangeChapters);
        

    }
// Function to fetch and set HTML content for Hello page with name and age
async function setChapter(novel, chapter) {
    const styleFile = "novel&chap.css"
    const stylesheet = document.getElementById("stylesheet");
    stylesheet.href = styleFile;
    
    
    try {

        // Fetch data from Firebase
        const chapter_data = await fetchFileContent(`chapters/${novel}-${chapter}.json`);
        if (chapter_data) {
            const english_title = chapter_data.english_title;
        const arabic_Title = chapter_data.arabic_title;
        const image = chapter_data.image;
        const description = chapter_data.description;
        const genres = chapter_data.genres;


        const chapter_content = chapter_data.chapter_info.chapter_content;
        const chapter_number = chapter_data.chapter_info.chapter_number;
        const chapter_title = chapter_data.chapter_info.chapter_title;

        // Select containers to append novel cards
        const chapterHeader = document.getElementById("chapterHeader");

        chapterHeader.innerHTML = `<a href="#/novel/${english_title}">
            <h1>${arabic_Title}</h1>
            <h2>${chapter_title}</h2>
        </a>
        `
        const chapterSpan = document.createElement("span");
        chapterSpan.innerHTML = chapter_content;
        chapterSpan.classList.add("themetext");
        const chapterDiv = document.getElementById("chapterDiv");

        chapterDiv.appendChild(chapterSpan);
        const novel_data = await fetchFileContent(`novels/${novel}.json`);
        const chapters_info = novel_data.chapters;
        const nextskipcontainer = document.getElementById("nextskipcontainer");
        for (let index = 0; index < Object.keys(chapters_info).length; index++) {
            const chapterNumber =  Object.keys(chapters_info)[index];
            if (chapterNumber === chapter_number) {
                const nextChapter = Object.keys(chapters_info)[index+1];
                const prevChapter = Object.keys(chapters_info)[index-1];
                const nextChapterHTML = document.createElement("a");
                const prevChapterHTML = document.createElement("a");
                if (nextChapter !== undefined) {
                    nextChapterHTML.textContent = 'التالي'
                    nextChapterHTML.classList.add("next-btn")
                    nextChapterHTML.setAttribute("href", `#/novel/${english_title}/${nextChapter}`)
                    nextskipcontainer.appendChild(nextChapterHTML);
                }
                if (prevChapter !== undefined) {
                    prevChapterHTML.textContent = 'السابق'
                    prevChapterHTML.classList.add("skip-btn");
                    prevChapterHTML.setAttribute("href", `#/novel/${english_title}/${prevChapter}`)
                    nextskipcontainer.appendChild(prevChapterHTML);

                }
               
            }
            
        }
            
        }else{
            notFound();
        }
        

        }catch (error) {
            notFound();
        }
        themeOnStart();

}

// Function to fetch and set HTML content
async function fetchAndSetContent(file) {
    const contentDiv = document.getElementById('content');
    
    // Fetch HTML content from the specified file
    fetch(file)
        .then(response => {
            if (!response.ok) {
                throw Error('File not found');
            }
            return response.text();
        })
        .then(data => {
            setContent(data); // Set fetched HTML content into the content div
        })
        .catch(error => {
            setContent('<h2>Error Loading Page</h2><p>Failed to load the requested page.</p>');
        });
}

// Function to set HTML content in the content div
function setContent(html) {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = html;
}

// Initial load or when hash changes
window.addEventListener('hashchange', loadContent);
window.addEventListener('DOMContentLoaded', loadContent);

























document.addEventListener("DOMContentLoaded", function() {
    var searchBox = document.getElementById("search-box");
    var searchResults = document.getElementById("search-results");
    var timeoutId;

    // Add input event listener for search box
    searchBox.addEventListener("input", function() {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(handleSearchInput, 500);
    });

    // Function to handle search input
    async function handleSearchInput() {
        var query = searchBox.value.trim();

        // Replace spaces with hyphens
        query = query.replace(/\s+/g, "-");
        // Check if the query has at least three characters
        if (query.length >= 3) {
            // Make fetch request to Flask endpoint
            const data = await fetchSearchFile(query);
            if (data && data.english_titles && data.arabic_titles && data.images &&
                Array.isArray(data.english_titles) && Array.isArray(data.arabic_titles) && Array.isArray(data.images)) {
                generateHTML(data);
            } else {
                searchResults.innerHTML = "";
                throw new Error('One or more arrays are missing or not in the expected format in the fetched data');
            }
 

        } else {
            // Clear search results if query length is less than three characters
            searchResults.innerHTML = "";
        }
    }

    // Function to generate HTML based on the fetched data
    // Function to generate HTML based on the fetched data
    function generateHTML(data) {
        try {

            const template = document.getElementById('data-card-template');
            if (!template) {
                console.error('Template element not found');
                return;
            }

            const container = document.getElementById('search-results');
            if (!container) {
                console.error('Container element not found');
                return;
            }

            // Clear existing search results
            container.innerHTML = "";

            // Check if the arrays exist and have the same length
            if (!data || !data.english_titles || !data.arabic_titles || !data.images ||
                data.english_titles.length !== data.arabic_titles.length ||
                data.english_titles.length !== data.images.length || data.english_titles.length == 0) {
                console.error('Data is missing or not in the expected format');

           return;
            }

            // Iterate over the arrays and generate HTML
            for (let i = 0; i < data.english_titles.length; i++) {
                const clone = document.importNode(template.content, true);
                const anchor = clone.querySelector('.search-card');
                const cardHeader = clone.querySelector('.card-header');
                const cardBody = clone.querySelector('.card-body');
                const cardImage = clone.querySelector('img');

                // Set href attribute of the anchor tag
                anchor.href = "/novel/" + data.english_titles[i];

                // Set text content and image source
                try {
                    cardHeader.textContent = data.english_titles[i].replace(/-/g, " ");

                }catch{}
                cardBody.textContent = data.arabic_titles[i];
                cardImage.src = data.images[i];

                // Set text direction to right-to-left for Arabic text
                cardBody.dir = 'rtl';

                container.appendChild(clone);
            }
        } catch (error) {
            console.error('Error generating HTML:', error);
        }
    }

    // Add click event listener to the document body
    document.body.addEventListener("click", function(event) {
        // Check if the click event occurred outside the search box or search results
        if (!searchBox.contains(event.target) && !searchResults.contains(event.target)) {
            // Clear search results when clicking outside the search box or search results
            searchResults.innerHTML = "";
        }
});
});














//--------------------------------------------------------------------------------------------------- */
// Function to set dark mode
function setDarkMode() {
    var bodyContainer = document.querySelector('.bodycontainer');
    var chapterHeader = document.querySelector('.chapter-header');
    var settingheader = document.querySelector('.settings-header');
    var chapterparagraph = document.querySelector('.chapter-paragraph');
    var themeTextElements = document.querySelectorAll('.themetext');
    var settingsImgElement = document.getElementById('settingsimg');
    var libraryimg = document.getElementById('libraryimg');
    var body = document.body;
    var headercontainer = document.querySelector('.header-container');

    if (body) {
        body.style.backgroundColor = 'black';
    }
    if (bodyContainer) {
      bodyContainer.style.backgroundColor = 'black';
    }
    if (chapterHeader) {
        chapterHeader.style.backgroundColor = '#3d3d3db9';
      }
    if (settingheader) {
        settingheader.style.backgroundColor = '#3d3d3db9';
    }
    if (chapterparagraph) {
        chapterparagraph.style.backgroundColor = '#3d3d3db9';
    }
    themeTextElements.forEach(function(element) {
        element.style.color = 'white';
        });
    var themeElements = document.querySelectorAll('.theme');
    themeElements.forEach(function(element) {
        element.style.backgroundImage = 'url("https://raw.githubusercontent.com/Ma1rwan/lavanovelPictures/main/black.png")';
    });
    var updown = document.querySelectorAll('.updown');
    updown.forEach(function(element) {
        element.style.backgroundImage = 'url("https://raw.githubusercontent.com/Ma1rwan/lavanovelPictures/main/arrowwhite.png")';
    });
    var settingsImgElement = document.querySelectorAll('.settingsimg');
    settingsImgElement.forEach(function(element) {
        element.style.backgroundImage = 'url("https://raw.githubusercontent.com/Ma1rwan/lavanovelPictures/main/settingswhite.png")';
    });
    if (headercontainer) {
        headercontainer.style.backgroundColor = '#1a1919';
    }
    if (libraryimg) {
        libraryimg.src = "https://raw.githubusercontent.com/Ma1rwan/lavanovelPictures/main/libraryblack.png";
    }
  }

  // Function to set light mode
  function setLightMode() {
    var bodyContainer = document.querySelector('.bodycontainer');
    var chapterHeader = document.querySelector('.chapter-header');
    var settingheader = document.querySelector('.settings-header');
    var chapterparagraph = document.querySelector('.chapter-paragraph');
    var themeTextElements = document.querySelectorAll('.themetext');
    var settingsImgElement = document.getElementById('settingsimg');
    var libraryimg = document.getElementById('libraryimg');
    var body = document.body;
    var headercontainer = document.querySelector('.header-container');
    var themeElements = document.querySelectorAll('.theme');
    themeElements.forEach(function(element) {
        element.style.backgroundImage = 'url("https://raw.githubusercontent.com/Ma1rwan/lavanovelPictures/main/white.png")'; // Reset to default
    });
    var updown = document.querySelectorAll('.updown');
    updown.forEach(function(element) {
        element.style.backgroundImage = 'url("https://raw.githubusercontent.com/Ma1rwan/lavanovelPictures/main/arrowblack.png")';
    });

    if (body) {
        body.style.backgroundColor = 'white';
    }

    if (bodyContainer) {
      bodyContainer.style.backgroundColor = 'transparent';
    }
    if (chapterHeader) {
        chapterHeader.style.backgroundColor = 'transparent';
      }
    if (settingheader) {
        settingheader.style.backgroundColor = 'transparent';
    }
    if (chapterparagraph) {
        chapterparagraph.style.backgroundColor = 'transparent';
    }
    themeTextElements.forEach(function(element) {
        element.style.color = 'black';
        });

    if (headercontainer) {
        headercontainer.style.backgroundColor = '#f1f1f1';
    }


    var settingsImgElement = document.querySelectorAll('.settingsimg');
    settingsImgElement.forEach(function(element) {
        element.style.backgroundImage = 'url("https://raw.githubusercontent.com/Ma1rwan/lavanovelPictures/main/settingsblack.png")';
    });
    if (libraryimg) {
        libraryimg.src = "https://raw.githubusercontent.com/Ma1rwan/lavanovelPictures/main/librarywhite.png";
    }
  }

  // Function to handle theme
  function theme() {
    // Get the theme from local storage
    var currentTheme = localStorage.getItem('theme');
    var body = document.body;


    // If the theme is black, set light mode
    if (currentTheme === 'black') {
        body.style.backgroundColor = 'black';

      setLightMode();
      localStorage.setItem('theme', 'white');
    }else{
        body.style.backgroundColor = 'white';
        setDarkMode()
        localStorage.setItem('theme', 'black');


    }

  }


  function themeOnStart() {
    // Call the theme function
    var currentTheme = localStorage.getItem('theme');
    if (currentTheme === "black") {
        setDarkMode()

    }else{
        setLightMode();
    }
  }

  // Run the themeOnStart function when the page is loaded
  window.addEventListener('load', themeOnStart);


// Get the button and chapters container
var ascendingOrder = true; // Variable to track sorting order

function rearrangeChapters() {
    try {
        var updownButton = document.getElementById('chapters');
        var chaptersContainer = document.getElementById('chapters');
        var chapters = Array.from(chaptersContainer.querySelectorAll('.chapter'));
        chapters.sort(function(a, b) {
            var chapterNumberA = parseInt(a.querySelector('.chapter-number').textContent);
            var chapterNumberB = parseInt(b.querySelector('.chapter-number').textContent);
            if (ascendingOrder) {
                return chapterNumberA - chapterNumberB;
            } else {
                return chapterNumberB - chapterNumberA;
            }
        });

        chapters.forEach(function(chapter) {
            chaptersContainer.removeChild(chapter);
        });

        chapters.forEach(function(chapter) {
            chaptersContainer.appendChild(chapter);
        });

        // Toggle sorting order for the next click
        ascendingOrder = !ascendingOrder;
    } catch (error) {
        console.error(error)
    }
    
}






function toggleSidebar() {
    var sidebar = document.getElementById('sidebar2');
    sidebar.classList.toggle('active'); // Toggle the 'active' class
}

// Add event listener to hide the second sidebar when clicking outside of it
document.body.addEventListener('click', function(event) {
    var secondSidebar = document.getElementById('sidebar2');
    if (!secondSidebar.contains(event.target) && event.target.id !== 'sidebarButton') { // Check if click target is not within the second sidebar or the toggle button
        secondSidebar.classList.remove('active'); // Hide the second sidebar
    }
});