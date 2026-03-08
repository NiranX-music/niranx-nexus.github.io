export interface FreeApi {
  id: string;
  name: string;
  description: string;
  category: string;
  baseUrl: string;
  sampleEndpoint: string;
  docsUrl?: string;
  responseType: "json" | "xml" | "text" | "image";
  icon: string;
}

export const apiCategories = [
  "All",
  "Space & Science",
  "Animals",
  "Fun & Random",
  "Food & Drink",
  "Finance",
  "Weather & Geo",
  "Music & Media",
  "Games",
  "Art & Culture",
  "Books & Education",
  "Tech & Dev",
  "Sports",
  "Government",
  "Health",
] as const;

export const freeApis: FreeApi[] = [
  // ===== Space & Science (10) =====
  { id: "nasa-apod", name: "NASA APOD", description: "Astronomy Picture of the Day", category: "Space & Science", baseUrl: "https://api.nasa.gov", sampleEndpoint: "/planetary/apod?api_key=DEMO_KEY", docsUrl: "https://api.nasa.gov", responseType: "json", icon: "🌌" },
  { id: "spacex-launches", name: "SpaceX Launches", description: "Latest SpaceX launch data", category: "Space & Science", baseUrl: "https://api.spacexdata.com/v5", sampleEndpoint: "/launches/latest", docsUrl: "https://github.com/r-spacex/SpaceX-API", responseType: "json", icon: "🚀" },
  { id: "iss-location", name: "ISS Location", description: "Real-time International Space Station position", category: "Space & Science", baseUrl: "http://api.open-notify.org", sampleEndpoint: "/iss-now.json", docsUrl: "http://open-notify.org/Open-Notify-API/", responseType: "json", icon: "🛸" },
  { id: "people-in-space", name: "People in Space", description: "Current astronauts in space", category: "Space & Science", baseUrl: "http://api.open-notify.org", sampleEndpoint: "/astros.json", docsUrl: "http://open-notify.org/Open-Notify-API/", responseType: "json", icon: "👨‍🚀" },
  { id: "usgs-earthquakes", name: "USGS Earthquakes", description: "Recent earthquake data worldwide", category: "Space & Science", baseUrl: "https://earthquake.usgs.gov", sampleEndpoint: "/fdsnws/event/1/query?format=geojson&limit=5", docsUrl: "https://earthquake.usgs.gov/fdsnws/event/1/", responseType: "json", icon: "🌍" },
  { id: "sunrise-sunset", name: "Sunrise & Sunset", description: "Sunrise/sunset times for any location", category: "Space & Science", baseUrl: "https://api.sunrise-sunset.org", sampleEndpoint: "/json?lat=36.7201600&lng=-4.4203400", docsUrl: "https://sunrise-sunset.org/api", responseType: "json", icon: "🌅" },
  { id: "solar-system", name: "Solar System", description: "Solar system bodies data", category: "Space & Science", baseUrl: "https://api.le-systeme-solaire.net/rest", sampleEndpoint: "/bodies?filter[]=isPlanet,eq,true", docsUrl: "https://api.le-systeme-solaire.net", responseType: "json", icon: "☀️" },
  { id: "space-news", name: "Space News", description: "Latest space flight news articles", category: "Space & Science", baseUrl: "https://api.spaceflightnewsapi.net/v4", sampleEndpoint: "/articles/?limit=5", docsUrl: "https://api.spaceflightnewsapi.net", responseType: "json", icon: "📰" },
  { id: "nasa-mars", name: "NASA Mars Photos", description: "Mars rover photos", category: "Space & Science", baseUrl: "https://api.nasa.gov", sampleEndpoint: "/mars-photos/api/v1/rovers/curiosity/photos?sol=1000&page=1&api_key=DEMO_KEY", docsUrl: "https://api.nasa.gov", responseType: "json", icon: "🔴" },
  { id: "nasa-epic", name: "NASA EPIC", description: "Earth Polychromatic Imaging Camera", category: "Space & Science", baseUrl: "https://api.nasa.gov", sampleEndpoint: "/EPIC/api/natural?api_key=DEMO_KEY", docsUrl: "https://api.nasa.gov", responseType: "json", icon: "🌎" },

  // ===== Animals (8) =====
  { id: "dog-api", name: "Dog API", description: "Random dog images", category: "Animals", baseUrl: "https://dog.ceo/api", sampleEndpoint: "/breeds/image/random", docsUrl: "https://dog.ceo/dog-api/", responseType: "json", icon: "🐕" },
  { id: "cat-facts", name: "Cat Facts", description: "Random cat facts", category: "Animals", baseUrl: "https://catfact.ninja", sampleEndpoint: "/fact", docsUrl: "https://catfact.ninja", responseType: "json", icon: "🐱" },
  { id: "shibe-online", name: "Shibe.online", description: "Random shiba inu images", category: "Animals", baseUrl: "https://shibe.online/api", sampleEndpoint: "/shibes?count=4", docsUrl: "https://shibe.online", responseType: "json", icon: "🐕‍🦺" },
  { id: "random-dog", name: "Random Dog", description: "Random dog images & videos", category: "Animals", baseUrl: "https://random.dog", sampleEndpoint: "/woof.json", docsUrl: "https://random.dog", responseType: "json", icon: "🦮" },
  { id: "random-fox", name: "Random Fox", description: "Random fox images", category: "Animals", baseUrl: "https://randomfox.ca", sampleEndpoint: "/floof/", docsUrl: "https://randomfox.ca", responseType: "json", icon: "🦊" },
  { id: "http-cat", name: "HTTP Cat", description: "Cat images for HTTP status codes", category: "Animals", baseUrl: "https://http.cat", sampleEndpoint: "/200", docsUrl: "https://http.cat", responseType: "image", icon: "😸" },
  { id: "dog-ceo-list", name: "Dog Breeds", description: "List all dog breeds", category: "Animals", baseUrl: "https://dog.ceo/api", sampleEndpoint: "/breeds/list/all", docsUrl: "https://dog.ceo/dog-api/", responseType: "json", icon: "🐩" },
  { id: "placebear", name: "PlaceBear", description: "Placeholder bear images", category: "Animals", baseUrl: "https://placebear.com", sampleEndpoint: "/300/300", docsUrl: "https://placebear.com", responseType: "image", icon: "🐻" },

  // ===== Fun & Random (12) =====
  { id: "chuck-norris", name: "Chuck Norris Jokes", description: "Random Chuck Norris jokes", category: "Fun & Random", baseUrl: "https://api.chucknorris.io", sampleEndpoint: "/jokes/random", docsUrl: "https://api.chucknorris.io", responseType: "json", icon: "🥋" },
  { id: "dad-jokes", name: "Dad Jokes", description: "Random dad jokes", category: "Fun & Random", baseUrl: "https://icanhazdadjoke.com", sampleEndpoint: "/", docsUrl: "https://icanhazdadjoke.com/api", responseType: "json", icon: "😂" },
  { id: "bored-api", name: "Bored API", description: "Random activity suggestions", category: "Fun & Random", baseUrl: "https://bored-api.appbrewery.com", sampleEndpoint: "/api/activity", docsUrl: "https://bored-api.appbrewery.com", responseType: "json", icon: "🎯" },
  { id: "advice-slip", name: "Advice Slip", description: "Random life advice", category: "Fun & Random", baseUrl: "https://api.adviceslip.com", sampleEndpoint: "/advice", docsUrl: "https://api.adviceslip.com", responseType: "json", icon: "💡" },
  { id: "useless-facts", name: "Useless Facts", description: "Random useless facts", category: "Fun & Random", baseUrl: "https://uselessfacts.jsph.pl", sampleEndpoint: "/api/v2/facts/random", docsUrl: "https://uselessfacts.jsph.pl", responseType: "json", icon: "🤓" },
  { id: "numbers-api", name: "Numbers API", description: "Interesting number facts", category: "Fun & Random", baseUrl: "http://numbersapi.com", sampleEndpoint: "/random/trivia?json", docsUrl: "http://numbersapi.com", responseType: "json", icon: "🔢" },
  { id: "trivia-api", name: "Open Trivia", description: "Trivia questions database", category: "Fun & Random", baseUrl: "https://opentdb.com", sampleEndpoint: "/api.php?amount=5", docsUrl: "https://opentdb.com/api_config.php", responseType: "json", icon: "❓" },
  { id: "evil-insult", name: "Evil Insult", description: "Random evil insults", category: "Fun & Random", baseUrl: "https://evilinsult.com", sampleEndpoint: "/generate_insult.php?lang=en&type=json", docsUrl: "https://evilinsult.com/api", responseType: "json", icon: "😈" },
  { id: "affirmations", name: "Affirmations", description: "Random positive affirmations", category: "Fun & Random", baseUrl: "https://www.affirmations.dev", sampleEndpoint: "/", docsUrl: "https://www.affirmations.dev", responseType: "json", icon: "✨" },
  { id: "yes-no", name: "Yes or No", description: "Random yes/no answer with GIF", category: "Fun & Random", baseUrl: "https://yesno.wtf", sampleEndpoint: "/api", docsUrl: "https://yesno.wtf", responseType: "json", icon: "🎲" },
  { id: "random-user", name: "Random User", description: "Generate random user profiles", category: "Fun & Random", baseUrl: "https://randomuser.me", sampleEndpoint: "/api/?results=3", docsUrl: "https://randomuser.me/documentation", responseType: "json", icon: "👤" },
  { id: "deck-of-cards", name: "Deck of Cards", description: "Shuffle and draw virtual cards", category: "Fun & Random", baseUrl: "https://deckofcardsapi.com/api", sampleEndpoint: "/deck/new/draw/?count=5", docsUrl: "https://deckofcardsapi.com", responseType: "json", icon: "🃏" },

  // ===== Food & Drink (6) =====
  { id: "mealdb", name: "TheMealDB", description: "Random meals and recipes", category: "Food & Drink", baseUrl: "https://www.themealdb.com/api/json/v1/1", sampleEndpoint: "/random.php", docsUrl: "https://www.themealdb.com/api.php", responseType: "json", icon: "🍕" },
  { id: "cocktaildb", name: "TheCocktailDB", description: "Cocktail recipes", category: "Food & Drink", baseUrl: "https://www.thecocktaildb.com/api/json/v1/1", sampleEndpoint: "/random.php", docsUrl: "https://www.thecocktaildb.com/api.php", responseType: "json", icon: "🍹" },
  { id: "open-food", name: "Open Food Facts", description: "World food products database", category: "Food & Drink", baseUrl: "https://world.openfoodfacts.org/api/v0", sampleEndpoint: "/product/737628064502.json", docsUrl: "https://world.openfoodfacts.org/data", responseType: "json", icon: "🛒" },
  { id: "open-brewery", name: "Open Brewery DB", description: "Breweries around the world", category: "Food & Drink", baseUrl: "https://api.openbrewerydb.org/v1", sampleEndpoint: "/breweries?per_page=5", docsUrl: "https://www.openbrewerydb.org", responseType: "json", icon: "🍺" },
  { id: "coffee-api", name: "Coffee API", description: "Random coffee images", category: "Food & Drink", baseUrl: "https://coffee.alexflipnote.dev", sampleEndpoint: "/random.json", docsUrl: "https://coffee.alexflipnote.dev", responseType: "json", icon: "☕" },
  { id: "punkapi", name: "Punk API", description: "BrewDog beer catalogue", category: "Food & Drink", baseUrl: "https://api.punkapi.com/v2", sampleEndpoint: "/beers/random", docsUrl: "https://punkapi.com/documentation/v2", responseType: "json", icon: "🍻" },

  // ===== Finance (6) =====
  { id: "coingecko", name: "CoinGecko", description: "Cryptocurrency prices and data", category: "Finance", baseUrl: "https://api.coingecko.com/api/v3", sampleEndpoint: "/coins/markets?vs_currency=usd&per_page=5", docsUrl: "https://www.coingecko.com/api/documentation", responseType: "json", icon: "💰" },
  { id: "coincap", name: "CoinCap", description: "Real-time crypto market data", category: "Finance", baseUrl: "https://api.coincap.io/v2", sampleEndpoint: "/assets?limit=5", docsUrl: "https://docs.coincap.io", responseType: "json", icon: "📈" },
  { id: "genderize", name: "Genderize", description: "Predict gender from a name", category: "Finance", baseUrl: "https://api.genderize.io", sampleEndpoint: "/?name=james", docsUrl: "https://genderize.io", responseType: "json", icon: "🧬" },
  { id: "agify", name: "Agify", description: "Predict age from a name", category: "Finance", baseUrl: "https://api.agify.io", sampleEndpoint: "/?name=michael", docsUrl: "https://agify.io", responseType: "json", icon: "🎂" },
  { id: "nationalize", name: "Nationalize", description: "Predict nationality from a name", category: "Finance", baseUrl: "https://api.nationalize.io", sampleEndpoint: "/?name=nathaniel", docsUrl: "https://nationalize.io", responseType: "json", icon: "🌐" },
  { id: "exchange-rate", name: "Exchange Rates", description: "Currency exchange rates", category: "Finance", baseUrl: "https://open.er-api.com/v6", sampleEndpoint: "/latest/USD", docsUrl: "https://www.exchangerate-api.com", responseType: "json", icon: "💱" },

  // ===== Weather & Geo (8) =====
  { id: "open-meteo", name: "Open-Meteo", description: "Free weather forecast API", category: "Weather & Geo", baseUrl: "https://api.open-meteo.com/v1", sampleEndpoint: "/forecast?latitude=52.52&longitude=13.41&current_weather=true", docsUrl: "https://open-meteo.com", responseType: "json", icon: "🌤️" },
  { id: "ip-api", name: "IP-API", description: "IP geolocation lookup", category: "Weather & Geo", baseUrl: "http://ip-api.com", sampleEndpoint: "/json/", docsUrl: "https://ip-api.com/docs", responseType: "json", icon: "📍" },
  { id: "restcountries", name: "REST Countries", description: "Country information", category: "Weather & Geo", baseUrl: "https://restcountries.com/v3.1", sampleEndpoint: "/all?fields=name,capital,flags,population&limit=5", docsUrl: "https://restcountries.com", responseType: "json", icon: "🗺️" },
  { id: "zippopotamus", name: "Zippopotam.us", description: "Zip/postal code lookup", category: "Weather & Geo", baseUrl: "https://api.zippopotam.us", sampleEndpoint: "/us/10001", docsUrl: "https://www.zippopotam.us", responseType: "json", icon: "📮" },
  { id: "worldtime", name: "WorldTimeAPI", description: "Current time for any timezone", category: "Weather & Geo", baseUrl: "https://worldtimeapi.org/api", sampleEndpoint: "/timezone/America/New_York", docsUrl: "https://worldtimeapi.org", responseType: "json", icon: "🕐" },
  { id: "universities", name: "Universities", description: "Universities search by country", category: "Weather & Geo", baseUrl: "http://universities.hipolabs.com", sampleEndpoint: "/search?country=United+States&limit=5", docsUrl: "https://github.com/Hipo/university-domains-list-api", responseType: "json", icon: "🏫" },
  { id: "country-flags", name: "Country Flags", description: "Country flag images", category: "Weather & Geo", baseUrl: "https://flagcdn.com", sampleEndpoint: "/w320/us.png", docsUrl: "https://flagpedia.net/download/api", responseType: "image", icon: "🏳️" },
  { id: "geocode-xyz", name: "Geocode.xyz", description: "Forward/reverse geocoding", category: "Weather & Geo", baseUrl: "https://geocode.xyz", sampleEndpoint: "/51.5074,-0.1278?json=1", docsUrl: "https://geocode.xyz/api", responseType: "json", icon: "🧭" },

  // ===== Music & Media (6) =====
  { id: "itunes-search", name: "iTunes Search", description: "Search Apple iTunes content", category: "Music & Media", baseUrl: "https://itunes.apple.com", sampleEndpoint: "/search?term=radiohead&limit=5", docsUrl: "https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/", responseType: "json", icon: "🎵" },
  { id: "musicbrainz", name: "MusicBrainz", description: "Open music encyclopedia", category: "Music & Media", baseUrl: "https://musicbrainz.org/ws/2", sampleEndpoint: "/artist/?query=radiohead&fmt=json&limit=5", docsUrl: "https://musicbrainz.org/doc/MusicBrainz_API", responseType: "json", icon: "🎶" },
  { id: "deezer", name: "Deezer", description: "Search Deezer music catalog", category: "Music & Media", baseUrl: "https://api.deezer.com", sampleEndpoint: "/search?q=eminem&limit=5", docsUrl: "https://developers.deezer.com/api", responseType: "json", icon: "🎧" },
  { id: "radio-browser", name: "Radio Browser", description: "Internet radio stations", category: "Music & Media", baseUrl: "https://de1.api.radio-browser.info/json", sampleEndpoint: "/stations/topvote?limit=5", docsUrl: "https://api.radio-browser.info", responseType: "json", icon: "📻" },
  { id: "binary-jazz", name: "Binary Jazz", description: "Random music genre generator", category: "Music & Media", baseUrl: "https://binaryjazz.us/wp-json/genrenator/v1", sampleEndpoint: "/genre/5", docsUrl: "https://binaryjazz.us/genrenator-api/", responseType: "json", icon: "🎷" },
  { id: "lyrics-ovh", name: "Lyrics.ovh", description: "Get song lyrics", category: "Music & Media", baseUrl: "https://api.lyrics.ovh/v1", sampleEndpoint: "/coldplay/yellow", docsUrl: "https://lyricsovh.docs.apiary.io", responseType: "json", icon: "🎤" },

  // ===== Games (8) =====
  { id: "pokeapi", name: "PokéAPI", description: "Pokémon game data", category: "Games", baseUrl: "https://pokeapi.co/api/v2", sampleEndpoint: "/pokemon?limit=10", docsUrl: "https://pokeapi.co/docs/v2", responseType: "json", icon: "⚡" },
  { id: "open-trivia", name: "Open Trivia DB", description: "Trivia questions database", category: "Games", baseUrl: "https://opentdb.com", sampleEndpoint: "/api.php?amount=5&type=multiple", docsUrl: "https://opentdb.com/api_config.php", responseType: "json", icon: "🧠" },
  { id: "dnd-api", name: "D&D 5e API", description: "Dungeons & Dragons SRD data", category: "Games", baseUrl: "https://www.dnd5eapi.co/api", sampleEndpoint: "/classes", docsUrl: "https://www.dnd5eapi.co", responseType: "json", icon: "🐉" },
  { id: "chess-com", name: "Chess.com", description: "Chess player data and puzzles", category: "Games", baseUrl: "https://api.chess.com/pub", sampleEndpoint: "/puzzle/random", docsUrl: "https://www.chess.com/news/view/published-data-api", responseType: "json", icon: "♟️" },
  { id: "jservice", name: "JService", description: "Jeopardy trivia clues", category: "Games", baseUrl: "https://jservice.io", sampleEndpoint: "/api/random?count=5", docsUrl: "https://jservice.io", responseType: "json", icon: "📺" },
  { id: "pokemon-tcg", name: "Pokémon TCG", description: "Pokémon Trading Card Game data", category: "Games", baseUrl: "https://api.pokemontcg.io/v2", sampleEndpoint: "/cards?pageSize=5", docsUrl: "https://docs.pokemontcg.io", responseType: "json", icon: "🎴" },
  { id: "free-to-play", name: "Free-To-Play Games", description: "Free-to-play games database", category: "Games", baseUrl: "https://www.freetogame.com/api", sampleEndpoint: "/games?sort-by=popularity&platform=pc", docsUrl: "https://www.freetogame.com/api-doc", responseType: "json", icon: "🎮" },
  { id: "cheapshark", name: "CheapShark", description: "Game deals and prices", category: "Games", baseUrl: "https://www.cheapshark.com/api/1.0", sampleEndpoint: "/deals?storeID=1&upperPrice=15&pageSize=5", docsUrl: "https://apidocs.cheapshark.com", responseType: "json", icon: "🏷️" },

  // ===== Art & Culture (8) =====
  { id: "art-institute", name: "Art Institute Chicago", description: "Art Institute of Chicago collection", category: "Art & Culture", baseUrl: "https://api.artic.edu/api/v1", sampleEndpoint: "/artworks?limit=5&fields=id,title,artist_display,image_id", docsUrl: "https://api.artic.edu/docs/", responseType: "json", icon: "🖼️" },
  { id: "met-museum", name: "Metropolitan Museum", description: "Met Museum open-access collection", category: "Art & Culture", baseUrl: "https://collectionapi.metmuseum.org/public/collection/v1", sampleEndpoint: "/search?q=sunflowers&isHighlight=true", docsUrl: "https://metmuseum.github.io", responseType: "json", icon: "🏛️" },
  { id: "rijksmuseum", name: "Rijksmuseum", description: "Rijksmuseum collection data", category: "Art & Culture", baseUrl: "https://www.rijksmuseum.nl/api/en", sampleEndpoint: "/collection?key=0fiuZFh4&ps=5", docsUrl: "https://data.rijksmuseum.nl", responseType: "json", icon: "🎨" },
  { id: "lorem-picsum", name: "Lorem Picsum", description: "Random placeholder photos", category: "Art & Culture", baseUrl: "https://picsum.photos", sampleEndpoint: "/v2/list?page=1&limit=6", docsUrl: "https://picsum.photos", responseType: "json", icon: "📸" },
  { id: "color-api", name: "The Color API", description: "Color scheme generation", category: "Art & Culture", baseUrl: "https://www.thecolorapi.com", sampleEndpoint: "/id?hex=0047AB&format=json", docsUrl: "https://www.thecolorapi.com/docs", responseType: "json", icon: "🎨" },
  { id: "icon-horse", name: "Icon Horse", description: "Favicons for any website", category: "Art & Culture", baseUrl: "https://icon.horse", sampleEndpoint: "/icon/google.com", docsUrl: "https://icon.horse", responseType: "image", icon: "🐴" },
  { id: "placeholder", name: "Placeholder.com", description: "Dynamic placeholder images", category: "Art & Culture", baseUrl: "https://via.placeholder.com", sampleEndpoint: "/300x200/09f/fff.png?text=Hello", docsUrl: "https://placeholder.com", responseType: "image", icon: "🖼️" },
  { id: "colormind", name: "Colormind", description: "AI color palette generator", category: "Art & Culture", baseUrl: "http://colormind.io/api", sampleEndpoint: "/", docsUrl: "http://colormind.io/api-access/", responseType: "json", icon: "🌈" },

  // ===== Books & Education (6) =====
  { id: "open-library", name: "Open Library", description: "Search millions of books", category: "Books & Education", baseUrl: "https://openlibrary.org", sampleEndpoint: "/search.json?q=javascript&limit=5", docsUrl: "https://openlibrary.org/developers/api", responseType: "json", icon: "📚" },
  { id: "gutenberg", name: "Project Gutenberg", description: "Free public domain eBooks", category: "Books & Education", baseUrl: "https://gutendex.com", sampleEndpoint: "/books?search=shakespeare&page=1", docsUrl: "https://gutendex.com", responseType: "json", icon: "📖" },
  { id: "wikipedia", name: "Wikipedia", description: "Wikipedia article search", category: "Books & Education", baseUrl: "https://en.wikipedia.org/api/rest_v1", sampleEndpoint: "/page/summary/Artificial_intelligence", docsUrl: "https://en.wikipedia.org/api/rest_v1/", responseType: "json", icon: "📝" },
  { id: "dictionary", name: "Dictionary API", description: "English word definitions", category: "Books & Education", baseUrl: "https://api.dictionaryapi.dev/api/v2", sampleEndpoint: "/entries/en/hello", docsUrl: "https://dictionaryapi.dev", responseType: "json", icon: "📕" },
  { id: "urban-dictionary", name: "Urban Dictionary", description: "Slang definitions (unofficial)", category: "Books & Education", baseUrl: "https://api.urbandictionary.com/v0", sampleEndpoint: "/define?term=yeet", docsUrl: "https://urbandictionary.com", responseType: "json", icon: "🗣️" },
  { id: "quotable", name: "Quotable", description: "Famous quotes database", category: "Books & Education", baseUrl: "https://api.quotable.io", sampleEndpoint: "/quotes/random", docsUrl: "https://github.com/lukePeavey/quotable", responseType: "json", icon: "💬" },

  // ===== Tech & Dev (8) =====
  { id: "github-users", name: "GitHub Users", description: "GitHub public user profiles", category: "Tech & Dev", baseUrl: "https://api.github.com", sampleEndpoint: "/users?per_page=5", docsUrl: "https://docs.github.com/rest", responseType: "json", icon: "🐙" },
  { id: "jsonplaceholder", name: "JSONPlaceholder", description: "Fake REST API for testing", category: "Tech & Dev", baseUrl: "https://jsonplaceholder.typicode.com", sampleEndpoint: "/posts?_limit=5", docsUrl: "https://jsonplaceholder.typicode.com", responseType: "json", icon: "🧪" },
  { id: "reqres", name: "ReqRes", description: "Hosted REST-API for testing", category: "Tech & Dev", baseUrl: "https://reqres.in", sampleEndpoint: "/api/users?page=1", docsUrl: "https://reqres.in", responseType: "json", icon: "🔄" },
  { id: "httpbin", name: "HTTPBin", description: "HTTP request/response testing", category: "Tech & Dev", baseUrl: "https://httpbin.org", sampleEndpoint: "/get", docsUrl: "https://httpbin.org", responseType: "json", icon: "🌐" },
  { id: "ipify", name: "IPify", description: "Get your public IP address", category: "Tech & Dev", baseUrl: "https://api.ipify.org", sampleEndpoint: "/?format=json", docsUrl: "https://www.ipify.org", responseType: "json", icon: "🔗" },
  { id: "hacker-news", name: "Hacker News", description: "Top tech news stories", category: "Tech & Dev", baseUrl: "https://hacker-news.firebaseio.com/v0", sampleEndpoint: "/topstories.json?limitToFirst=10&orderBy=%22$key%22", docsUrl: "https://github.com/HackerNews/API", responseType: "json", icon: "🔶" },
  { id: "devto", name: "DEV.to", description: "Dev community articles", category: "Tech & Dev", baseUrl: "https://dev.to/api", sampleEndpoint: "/articles?per_page=5", docsUrl: "https://developers.forem.com/api", responseType: "json", icon: "👩‍💻" },
  { id: "public-apis", name: "Public APIs List", description: "List of free public APIs", category: "Tech & Dev", baseUrl: "https://api.publicapis.org", sampleEndpoint: "/entries?category=Animals&https=true", docsUrl: "https://api.publicapis.org", responseType: "json", icon: "📋" },

  // ===== Sports (6) =====
  { id: "thesportsdb", name: "TheSportsDB", description: "Sports data and images", category: "Sports", baseUrl: "https://www.thesportsdb.com/api/v1/json/3", sampleEndpoint: "/searchteams.php?t=Arsenal", docsUrl: "https://www.thesportsdb.com/api.php", responseType: "json", icon: "⚽" },
  { id: "f1-ergast", name: "F1 Ergast", description: "Formula 1 race data", category: "Sports", baseUrl: "https://ergast.com/api/f1", sampleEndpoint: "/current.json", docsUrl: "https://ergast.com/mrd/", responseType: "json", icon: "🏎️" },
  { id: "balldontlie", name: "BallDontLie", description: "NBA basketball stats", category: "Sports", baseUrl: "https://api.balldontlie.io/v1", sampleEndpoint: "/teams", docsUrl: "https://www.balldontlie.io", responseType: "json", icon: "🏀" },
  { id: "nhl-api", name: "NHL API", description: "National Hockey League data", category: "Sports", baseUrl: "https://statsapi.web.nhl.com/api/v1", sampleEndpoint: "/teams", docsUrl: "https://statsapi.web.nhl.com/api/v1", responseType: "json", icon: "🏒" },
  { id: "football-data", name: "Football Data", description: "European football leagues", category: "Sports", baseUrl: "https://api.football-data.org/v4", sampleEndpoint: "/competitions", docsUrl: "https://www.football-data.org/documentation", responseType: "json", icon: "🏟️" },
  { id: "cricketdata", name: "CricAPI", description: "Cricket match data", category: "Sports", baseUrl: "https://api.cricapi.com/v1", sampleEndpoint: "/currentMatches?apikey=test&offset=0", docsUrl: "https://www.cricapi.com", responseType: "json", icon: "🏏" },

  // ===== Government (4) =====
  { id: "data-usa", name: "Data USA", description: "US census and economic data", category: "Government", baseUrl: "https://datausa.io/api", sampleEndpoint: "/data?drilldowns=Nation&measures=Population&year=latest", docsUrl: "https://datausa.io/about/api/", responseType: "json", icon: "🇺🇸" },
  { id: "fbi-wanted", name: "FBI Wanted", description: "FBI most wanted list", category: "Government", baseUrl: "https://api.fbi.gov", sampleEndpoint: "/@wanted?pageSize=5", docsUrl: "https://api.fbi.gov/docs", responseType: "json", icon: "🔍" },
  { id: "federal-register", name: "Federal Register", description: "US government documents", category: "Government", baseUrl: "https://www.federalregister.gov/api/v1", sampleEndpoint: "/documents.json?per_page=5", docsUrl: "https://www.federalregister.gov/developers/documentation/api/v1", responseType: "json", icon: "📜" },
  { id: "open-fec", name: "OpenFEC", description: "US campaign finance data", category: "Government", baseUrl: "https://api.open.fec.gov/v1", sampleEndpoint: "/candidates?api_key=DEMO_KEY&per_page=5", docsUrl: "https://api.open.fec.gov/developers/", responseType: "json", icon: "🗳️" },

  // ===== Health (4) =====
  { id: "disease-sh", name: "Disease.sh", description: "COVID-19 and disease tracking", category: "Health", baseUrl: "https://disease.sh/v3", sampleEndpoint: "/covid-19/all", docsUrl: "https://disease.sh/docs/", responseType: "json", icon: "🦠" },
  { id: "openfda", name: "OpenFDA", description: "FDA drug and device data", category: "Health", baseUrl: "https://api.fda.gov", sampleEndpoint: "/drug/event.json?limit=3", docsUrl: "https://open.fda.gov/apis/", responseType: "json", icon: "💊" },
  { id: "who-gho", name: "WHO GHO", description: "World Health Organization data", category: "Health", baseUrl: "https://ghoapi.azureedge.net/api", sampleEndpoint: "/Indicator?$filter=contains(IndicatorName,'life expectancy')&$top=5", docsUrl: "https://www.who.int/data/gho", responseType: "json", icon: "🏥" },
  { id: "health-gov", name: "Health.gov", description: "Health topics and guidelines", category: "Health", baseUrl: "https://health.gov/myhealthfinder/api/v3", sampleEndpoint: "/topicsearch.json?TopicId=30", docsUrl: "https://health.gov/our-work/national-health-initiatives/health-literacy/consumer-health-content/free-web-content/apis-developers", responseType: "json", icon: "❤️" },
];
