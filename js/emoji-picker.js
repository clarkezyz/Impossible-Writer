/**
 * Emoji Picker Module for Markdown Studio
 * Handles all emoji-related functionality
 */

export class EmojiPicker {
  constructor() {
    this.picker = null;
    this.searchInput = null;
    this.grid = null;
    this.categories = null;
    this.currentTarget = null;
    this.triggerPosition = null;
    this.selectedIndex = 0;
    this.filteredEmojis = [];
    
    // Mobile detection for revolutionary UX
    this._isMobile = null;
    
    // Emoji dataset organized by categories
    this.emojis = {
      smileys: [
        {emoji: '😀', name: 'grinning face', keywords: 'happy smile grin'},
        {emoji: '😃', name: 'grinning face with big eyes', keywords: 'happy smile joy'},
        {emoji: '😄', name: 'grinning face with smiling eyes', keywords: 'happy smile joy laugh'},
        {emoji: '😁', name: 'beaming face with smiling eyes', keywords: 'happy smile joy'},
        {emoji: '😆', name: 'grinning squinting face', keywords: 'happy laugh haha'},
        {emoji: '😅', name: 'grinning face with sweat', keywords: 'happy laugh nervous'},
        {emoji: '😂', name: 'face with tears of joy', keywords: 'laugh crying happy'},
        {emoji: '🤣', name: 'rolling on the floor laughing', keywords: 'laugh lol rofl'},
        {emoji: '😊', name: 'smiling face with smiling eyes', keywords: 'happy smile'},
        {emoji: '😇', name: 'smiling face with halo', keywords: 'angel innocent'},
        {emoji: '🙂', name: 'slightly smiling face', keywords: 'smile happy'},
        {emoji: '🙃', name: 'upside down face', keywords: 'silly crazy'},
        {emoji: '😉', name: 'winking face', keywords: 'wink flirt'},
        {emoji: '😌', name: 'relieved face', keywords: 'calm peaceful'},
        {emoji: '😍', name: 'smiling face with heart eyes', keywords: 'love heart'},
        {emoji: '🥰', name: 'smiling face with hearts', keywords: 'love cute'},
        {emoji: '😘', name: 'face blowing a kiss', keywords: 'kiss love'},
        {emoji: '😗', name: 'kissing face', keywords: 'kiss'},
        {emoji: '😙', name: 'kissing face with smiling eyes', keywords: 'kiss happy'},
        {emoji: '😚', name: 'kissing face with closed eyes', keywords: 'kiss'},
        {emoji: '😋', name: 'face savoring food', keywords: 'yum delicious'},
        {emoji: '😛', name: 'face with tongue', keywords: 'tongue silly'},
        {emoji: '😝', name: 'squinting face with tongue', keywords: 'tongue silly'},
        {emoji: '😜', name: 'winking face with tongue', keywords: 'tongue wink'},
        {emoji: '🤪', name: 'zany face', keywords: 'crazy silly'},
        {emoji: '🤨', name: 'face with raised eyebrow', keywords: 'suspicious'},
        {emoji: '🧐', name: 'face with monocle', keywords: 'thinking'},
        {emoji: '🤓', name: 'nerd face', keywords: 'smart glasses'},
        {emoji: '😎', name: 'smiling face with sunglasses', keywords: 'cool sunglasses'},
        {emoji: '🤩', name: 'star struck', keywords: 'amazing wow'},
        {emoji: '🥳', name: 'partying face', keywords: 'party celebration'},
        {emoji: '😏', name: 'smirking face', keywords: 'smirk sly'},
        {emoji: '😒', name: 'unamused face', keywords: 'annoyed meh'},
        {emoji: '😞', name: 'disappointed face', keywords: 'sad disappointed'},
        {emoji: '😔', name: 'pensive face', keywords: 'sad thoughtful'},
        {emoji: '😟', name: 'worried face', keywords: 'worried concerned'},
        {emoji: '😕', name: 'confused face', keywords: 'confused'},
        {emoji: '🙁', name: 'slightly frowning face', keywords: 'sad frown'},
        {emoji: '☹️', name: 'frowning face', keywords: 'sad frown'},
        {emoji: '😣', name: 'persevering face', keywords: 'struggling hard'},
        {emoji: '😖', name: 'confounded face', keywords: 'frustrated'},
        {emoji: '😫', name: 'tired face', keywords: 'tired exhausted'},
        {emoji: '😩', name: 'weary face', keywords: 'tired frustrated'},
        {emoji: '🥺', name: 'pleading face', keywords: 'puppy eyes please'},
        {emoji: '😢', name: 'crying face', keywords: 'sad cry tear'},
        {emoji: '😭', name: 'loudly crying face', keywords: 'sad cry sobbing'},
        {emoji: '😤', name: 'face with steam from nose', keywords: 'angry frustrated'},
        {emoji: '😠', name: 'angry face', keywords: 'angry mad'},
        {emoji: '😡', name: 'pouting face', keywords: 'angry furious'},
        {emoji: '🤬', name: 'face with symbols on mouth', keywords: 'swearing angry'},
        {emoji: '🤯', name: 'exploding head', keywords: 'mind blown'},
        {emoji: '😳', name: 'flushed face', keywords: 'embarrassed'},
        {emoji: '🥵', name: 'hot face', keywords: 'hot sweating'},
        {emoji: '🥶', name: 'cold face', keywords: 'cold freezing'},
        {emoji: '😱', name: 'face screaming in fear', keywords: 'scared shock'},
        {emoji: '😨', name: 'fearful face', keywords: 'scared afraid'},
        {emoji: '😰', name: 'anxious face with sweat', keywords: 'nervous worried'},
        {emoji: '😥', name: 'sad but relieved face', keywords: 'phew relief'},
        {emoji: '😓', name: 'downcast face with sweat', keywords: 'tired work'},
        {emoji: '🤗', name: 'hugging face', keywords: 'hug embrace'},
        {emoji: '🤔', name: 'thinking face', keywords: 'thinking hmm'},
        {emoji: '🤭', name: 'face with hand over mouth', keywords: 'oops secret'},
        {emoji: '🤫', name: 'shushing face', keywords: 'quiet secret'},
        {emoji: '🤥', name: 'lying face', keywords: 'lie pinocchio'}
      ],
      people: [
        {emoji: '👋', name: 'waving hand', keywords: 'wave hello goodbye hi'},
        {emoji: '🤚', name: 'raised back of hand', keywords: 'hand stop'},
        {emoji: '🖐️', name: 'hand with fingers splayed', keywords: 'hand five'},
        {emoji: '✋', name: 'raised hand', keywords: 'hand stop'},
        {emoji: '🖖', name: 'vulcan salute', keywords: 'spock star trek'},
        {emoji: '👌', name: 'ok hand', keywords: 'ok perfect'},
        {emoji: '🤌', name: 'pinched fingers', keywords: 'italian chef'},
        {emoji: '🤏', name: 'pinching hand', keywords: 'small tiny'},
        {emoji: '✌️', name: 'victory hand', keywords: 'peace victory two'},
        {emoji: '🤞', name: 'crossed fingers', keywords: 'luck hope'},
        {emoji: '🤟', name: 'love you gesture', keywords: 'love you'},
        {emoji: '🤘', name: 'sign of the horns', keywords: 'rock metal'},
        {emoji: '🤙', name: 'call me hand', keywords: 'call phone'},
        {emoji: '👈', name: 'backhand index pointing left', keywords: 'left point'},
        {emoji: '👉', name: 'backhand index pointing right', keywords: 'right point'},
        {emoji: '👆', name: 'backhand index pointing up', keywords: 'up point'},
        {emoji: '🖕', name: 'middle finger', keywords: 'rude middle'},
        {emoji: '👇', name: 'backhand index pointing down', keywords: 'down point'},
        {emoji: '☝️', name: 'index pointing up', keywords: 'up one'},
        {emoji: '👍', name: 'thumbs up', keywords: 'good yes like'},
        {emoji: '👎', name: 'thumbs down', keywords: 'bad no dislike'},
        {emoji: '✊', name: 'raised fist', keywords: 'fist power'},
        {emoji: '👊', name: 'oncoming fist', keywords: 'punch fist'},
        {emoji: '🤛', name: 'left facing fist', keywords: 'fist bump'},
        {emoji: '🤜', name: 'right facing fist', keywords: 'fist bump'},
        {emoji: '👏', name: 'clapping hands', keywords: 'clap applause'},
        {emoji: '🙌', name: 'raising hands', keywords: 'praise celebration'},
        {emoji: '👐', name: 'open hands', keywords: 'hands open'},
        {emoji: '🤲', name: 'palms up together', keywords: 'pray please'},
        {emoji: '🤝', name: 'handshake', keywords: 'shake deal agreement'},
        {emoji: '🙏', name: 'folded hands', keywords: 'pray thank please'},
        {emoji: '✍️', name: 'writing hand', keywords: 'write writing'},
        {emoji: '💅', name: 'nail polish', keywords: 'nails polish'},
        {emoji: '🤳', name: 'selfie', keywords: 'selfie camera'},
        {emoji: '💪', name: 'flexed biceps', keywords: 'strong muscle flex'},
        {emoji: '🦾', name: 'mechanical arm', keywords: 'robot prosthetic'},
        {emoji: '🦿', name: 'mechanical leg', keywords: 'robot prosthetic'},
        {emoji: '🦵', name: 'leg', keywords: 'leg kick'},
        {emoji: '🦶', name: 'foot', keywords: 'foot kick'},
        {emoji: '👂', name: 'ear', keywords: 'ear listen'},
        {emoji: '🦻', name: 'ear with hearing aid', keywords: 'hearing deaf'},
        {emoji: '👃', name: 'nose', keywords: 'nose smell'},
        {emoji: '🧠', name: 'brain', keywords: 'brain smart think'},
        {emoji: '🫀', name: 'anatomical heart', keywords: 'heart organ'},
        {emoji: '🫁', name: 'lungs', keywords: 'lungs breathe'},
        {emoji: '🦷', name: 'tooth', keywords: 'tooth dental'},
        {emoji: '🦴', name: 'bone', keywords: 'bone skeleton'},
        {emoji: '👀', name: 'eyes', keywords: 'eyes look see'},
        {emoji: '👁️', name: 'eye', keywords: 'eye look see'},
        {emoji: '👅', name: 'tongue', keywords: 'tongue taste'},
        {emoji: '👄', name: 'mouth', keywords: 'mouth lips'},
        {emoji: '💋', name: 'kiss mark', keywords: 'kiss lips'},
        {emoji: '🩸', name: 'drop of blood', keywords: 'blood drop'}
      ],
      nature: [
        {emoji: '🐶', name: 'dog face', keywords: 'dog puppy pet'},
        {emoji: '🐱', name: 'cat face', keywords: 'cat kitten pet'},
        {emoji: '🐭', name: 'mouse face', keywords: 'mouse rodent'},
        {emoji: '🐹', name: 'hamster', keywords: 'hamster pet'},
        {emoji: '🐰', name: 'rabbit face', keywords: 'rabbit bunny'},
        {emoji: '🦊', name: 'fox', keywords: 'fox clever'},
        {emoji: '🐻', name: 'bear', keywords: 'bear strong'},
        {emoji: '🐼', name: 'panda', keywords: 'panda cute'},
        {emoji: '🐨', name: 'koala', keywords: 'koala australia'},
        {emoji: '🐯', name: 'tiger face', keywords: 'tiger strong'},
        {emoji: '🦁', name: 'lion', keywords: 'lion king'},
        {emoji: '🐮', name: 'cow face', keywords: 'cow moo'},
        {emoji: '🐷', name: 'pig face', keywords: 'pig oink'},
        {emoji: '🐸', name: 'frog', keywords: 'frog ribbit'},
        {emoji: '🌸', name: 'cherry blossom', keywords: 'flower pink spring'},
        {emoji: '💐', name: 'bouquet', keywords: 'flowers gift'},
        {emoji: '🌷', name: 'tulip', keywords: 'flower spring'},
        {emoji: '🌹', name: 'rose', keywords: 'flower love red'},
        {emoji: '🌺', name: 'hibiscus', keywords: 'flower tropical'},
        {emoji: '🌻', name: 'sunflower', keywords: 'flower yellow'},
        {emoji: '🌼', name: 'blossom', keywords: 'flower white'},
        {emoji: '🌍', name: 'earth globe europe africa', keywords: 'earth world globe'},
        {emoji: '🌎', name: 'earth globe americas', keywords: 'earth world globe'},
        {emoji: '🌏', name: 'earth globe asia australia', keywords: 'earth world globe'},
        {emoji: '🌕', name: 'full moon', keywords: 'moon night'},
        {emoji: '🌙', name: 'crescent moon', keywords: 'moon night sleep'},
        {emoji: '⭐', name: 'star', keywords: 'star favorite'},
        {emoji: '🌟', name: 'glowing star', keywords: 'star sparkle'},
        {emoji: '✨', name: 'sparkles', keywords: 'sparkle magic'},
        {emoji: '☀️', name: 'sun', keywords: 'sun sunny day'},
        {emoji: '☁️', name: 'cloud', keywords: 'cloud weather'},
        {emoji: '⛅', name: 'sun behind cloud', keywords: 'cloud sun partly'},
        {emoji: '🌧️', name: 'cloud with rain', keywords: 'rain weather'},
        {emoji: '⛈️', name: 'cloud with lightning and rain', keywords: 'storm thunder'},
        {emoji: '🌩️', name: 'cloud with lightning', keywords: 'lightning thunder'},
        {emoji: '❄️', name: 'snowflake', keywords: 'snow cold winter'},
        {emoji: '☃️', name: 'snowman', keywords: 'snow winter'},
        {emoji: '🌈', name: 'rainbow', keywords: 'rainbow colorful'}
      ],
      food: [
        {emoji: '🍎', name: 'red apple', keywords: 'apple fruit red'},
        {emoji: '🍊', name: 'tangerine', keywords: 'orange fruit citrus'},
        {emoji: '🍋', name: 'lemon', keywords: 'lemon citrus sour'},
        {emoji: '🍌', name: 'banana', keywords: 'banana fruit yellow'},
        {emoji: '🍉', name: 'watermelon', keywords: 'watermelon fruit summer'},
        {emoji: '🍇', name: 'grapes', keywords: 'grapes fruit wine'},
        {emoji: '🍓', name: 'strawberry', keywords: 'strawberry fruit red'},
        {emoji: '🫐', name: 'blueberries', keywords: 'blueberry fruit blue'},
        {emoji: '🍑', name: 'peach', keywords: 'peach fruit'},
        {emoji: '🍒', name: 'cherries', keywords: 'cherry fruit red'},
        {emoji: '🍍', name: 'pineapple', keywords: 'pineapple fruit tropical'},
        {emoji: '🥥', name: 'coconut', keywords: 'coconut tropical'},
        {emoji: '🥝', name: 'kiwi fruit', keywords: 'kiwi fruit green'},
        {emoji: '🍅', name: 'tomato', keywords: 'tomato vegetable red'},
        {emoji: '🍆', name: 'eggplant', keywords: 'eggplant vegetable purple'},
        {emoji: '🥑', name: 'avocado', keywords: 'avocado green'},
        {emoji: '🥦', name: 'broccoli', keywords: 'broccoli vegetable green'},
        {emoji: '🥬', name: 'leafy green', keywords: 'lettuce salad green'},
        {emoji: '🥒', name: 'cucumber', keywords: 'cucumber vegetable green'},
        {emoji: '🌶️', name: 'hot pepper', keywords: 'pepper spicy hot'},
        {emoji: '🫑', name: 'bell pepper', keywords: 'pepper vegetable'},
        {emoji: '🌽', name: 'ear of corn', keywords: 'corn vegetable yellow'},
        {emoji: '🥕', name: 'carrot', keywords: 'carrot vegetable orange'},
        {emoji: '🧄', name: 'garlic', keywords: 'garlic spice'},
        {emoji: '🧅', name: 'onion', keywords: 'onion vegetable'},
        {emoji: '🥔', name: 'potato', keywords: 'potato vegetable'},
        {emoji: '🍠', name: 'roasted sweet potato', keywords: 'sweet potato'},
        {emoji: '🥚', name: 'egg', keywords: 'egg breakfast'},
        {emoji: '🍳', name: 'cooking', keywords: 'egg frying pan'},
        {emoji: '🧈', name: 'butter', keywords: 'butter dairy'},
        {emoji: '🥞', name: 'pancakes', keywords: 'pancakes breakfast'},
        {emoji: '🧇', name: 'waffle', keywords: 'waffle breakfast'},
        {emoji: '🥓', name: 'bacon', keywords: 'bacon meat breakfast'},
        {emoji: '🥩', name: 'cut of meat', keywords: 'steak meat'},
        {emoji: '🍗', name: 'poultry leg', keywords: 'chicken meat'},
        {emoji: '🍖', name: 'meat on bone', keywords: 'meat bone'},
        {emoji: '🌭', name: 'hot dog', keywords: 'hotdog sausage'},
        {emoji: '🍔', name: 'hamburger', keywords: 'burger hamburger'},
        {emoji: '🍟', name: 'french fries', keywords: 'fries potato'},
        {emoji: '🍕', name: 'pizza', keywords: 'pizza cheese'},
        {emoji: '🥪', name: 'sandwich', keywords: 'sandwich bread'},
        {emoji: '🌮', name: 'taco', keywords: 'taco mexican'},
        {emoji: '🌯', name: 'burrito', keywords: 'burrito mexican'},
        {emoji: '🫔', name: 'tamale', keywords: 'tamale mexican'},
        {emoji: '🥙', name: 'stuffed flatbread', keywords: 'pita kebab'},
        {emoji: '🧆', name: 'falafel', keywords: 'falafel food'},
        {emoji: '🥚', name: 'egg', keywords: 'egg breakfast'},
        {emoji: '🍳', name: 'cooking', keywords: 'egg frying pan'},
        {emoji: '🥘', name: 'shallow pan of food', keywords: 'paella food'},
        {emoji: '🍲', name: 'pot of food', keywords: 'stew soup'},
        {emoji: '🫕', name: 'fondue', keywords: 'fondue cheese'},
        {emoji: '🥣', name: 'bowl with spoon', keywords: 'cereal soup'},
        {emoji: '🥗', name: 'green salad', keywords: 'salad healthy'},
        {emoji: '🍿', name: 'popcorn', keywords: 'popcorn movie'},
        {emoji: '🧈', name: 'butter', keywords: 'butter dairy'},
        {emoji: '🧂', name: 'salt', keywords: 'salt seasoning'},
        {emoji: '🥫', name: 'canned food', keywords: 'can food'},
        {emoji: '🍱', name: 'bento box', keywords: 'bento japanese'},
        {emoji: '🍘', name: 'rice cracker', keywords: 'cracker snack'},
        {emoji: '🍙', name: 'rice ball', keywords: 'onigiri japanese'},
        {emoji: '🍚', name: 'cooked rice', keywords: 'rice bowl'},
        {emoji: '🍛', name: 'curry rice', keywords: 'curry indian'},
        {emoji: '🍜', name: 'steaming bowl', keywords: 'noodles ramen'},
        {emoji: '🍝', name: 'spaghetti', keywords: 'pasta italian'},
        {emoji: '🍠', name: 'roasted sweet potato', keywords: 'sweet potato'},
        {emoji: '🍢', name: 'oden', keywords: 'skewer japanese'},
        {emoji: '🍣', name: 'sushi', keywords: 'sushi japanese'},
        {emoji: '🍤', name: 'fried shrimp', keywords: 'shrimp tempura'},
        {emoji: '🍥', name: 'fish cake with swirl', keywords: 'fish cake japanese'},
        {emoji: '🥮', name: 'moon cake', keywords: 'mooncake chinese'},
        {emoji: '🍡', name: 'dango', keywords: 'dango japanese sweet'},
        {emoji: '🥟', name: 'dumpling', keywords: 'dumpling chinese'},
        {emoji: '🥠', name: 'fortune cookie', keywords: 'fortune cookie'},
        {emoji: '🥡', name: 'takeout box', keywords: 'takeout chinese'},
        {emoji: '🦪', name: 'oyster', keywords: 'oyster seafood'},
        {emoji: '🍦', name: 'soft ice cream', keywords: 'ice cream dessert'},
        {emoji: '🍧', name: 'shaved ice', keywords: 'shaved ice dessert'},
        {emoji: '🍨', name: 'ice cream', keywords: 'ice cream dessert'},
        {emoji: '🍩', name: 'doughnut', keywords: 'donut dessert'},
        {emoji: '🍪', name: 'cookie', keywords: 'cookie dessert'},
        {emoji: '🎂', name: 'birthday cake', keywords: 'cake birthday'},
        {emoji: '🍰', name: 'shortcake', keywords: 'cake dessert'},
        {emoji: '🧁', name: 'cupcake', keywords: 'cupcake dessert'},
        {emoji: '🥧', name: 'pie', keywords: 'pie dessert'},
        {emoji: '🍫', name: 'chocolate bar', keywords: 'chocolate candy'},
        {emoji: '🍬', name: 'candy', keywords: 'candy sweet'},
        {emoji: '🍭', name: 'lollipop', keywords: 'lollipop candy'},
        {emoji: '🍮', name: 'custard', keywords: 'pudding dessert'},
        {emoji: '🍯', name: 'honey pot', keywords: 'honey sweet'},
        {emoji: '🍼', name: 'baby bottle', keywords: 'bottle baby milk'},
        {emoji: '🥛', name: 'glass of milk', keywords: 'milk drink'},
        {emoji: '☕', name: 'hot beverage', keywords: 'coffee tea hot'},
        {emoji: '🫖', name: 'teapot', keywords: 'tea pot'},
        {emoji: '🍵', name: 'teacup without handle', keywords: 'tea green matcha'},
        {emoji: '🍶', name: 'sake', keywords: 'sake alcohol japanese'},
        {emoji: '🍾', name: 'bottle with popping cork', keywords: 'champagne celebration'},
        {emoji: '🍷', name: 'wine glass', keywords: 'wine alcohol'},
        {emoji: '🍸', name: 'cocktail glass', keywords: 'cocktail martini'},
        {emoji: '🍹', name: 'tropical drink', keywords: 'tropical cocktail'},
        {emoji: '🍺', name: 'beer mug', keywords: 'beer alcohol'},
        {emoji: '🍻', name: 'clinking beer mugs', keywords: 'beer cheers'},
        {emoji: '🥂', name: 'clinking glasses', keywords: 'champagne cheers'},
        {emoji: '🥃', name: 'tumbler glass', keywords: 'whiskey alcohol'},
        {emoji: '🫗', name: 'pouring liquid', keywords: 'pour drink'},
        {emoji: '🥤', name: 'cup with straw', keywords: 'soda drink'},
        {emoji: '🧋', name: 'bubble tea', keywords: 'boba tea'},
        {emoji: '🧃', name: 'beverage box', keywords: 'juice box'},
        {emoji: '🧉', name: 'mate', keywords: 'mate drink'},
        {emoji: '🧊', name: 'ice', keywords: 'ice cube cold'}
      ],
      activities: [
        {emoji: '⚽', name: 'soccer ball', keywords: 'soccer football sport'},
        {emoji: '🏀', name: 'basketball', keywords: 'basketball sport'},
        {emoji: '🏈', name: 'american football', keywords: 'football sport'},
        {emoji: '⚾', name: 'baseball', keywords: 'baseball sport'},
        {emoji: '🥎', name: 'softball', keywords: 'softball sport'},
        {emoji: '🎾', name: 'tennis', keywords: 'tennis sport'},
        {emoji: '🏐', name: 'volleyball', keywords: 'volleyball sport'},
        {emoji: '🏉', name: 'rugby football', keywords: 'rugby sport'},
        {emoji: '🥏', name: 'flying disc', keywords: 'frisbee sport'},
        {emoji: '🎱', name: 'pool 8 ball', keywords: 'billiards game'},
        {emoji: '🪀', name: 'yo-yo', keywords: 'yoyo toy'},
        {emoji: '🏓', name: 'ping pong', keywords: 'table tennis sport'},
        {emoji: '🏸', name: 'badminton', keywords: 'badminton sport'},
        {emoji: '🏒', name: 'ice hockey', keywords: 'hockey sport'},
        {emoji: '🏑', name: 'field hockey', keywords: 'hockey sport'},
        {emoji: '🥍', name: 'lacrosse', keywords: 'lacrosse sport'},
        {emoji: '🏏', name: 'cricket game', keywords: 'cricket sport'},
        {emoji: '🪃', name: 'boomerang', keywords: 'boomerang australia'},
        {emoji: '🥅', name: 'goal net', keywords: 'goal soccer'},
        {emoji: '⛳', name: 'flag in hole', keywords: 'golf sport'},
        {emoji: '🪁', name: 'kite', keywords: 'kite fly'},
        {emoji: '🛝', name: 'playground slide', keywords: 'slide playground'},
        {emoji: '🏹', name: 'bow and arrow', keywords: 'archery bow'},
        {emoji: '🎣', name: 'fishing pole', keywords: 'fishing sport'},
        {emoji: '🤿', name: 'diving mask', keywords: 'diving snorkel'},
        {emoji: '🥊', name: 'boxing glove', keywords: 'boxing sport'},
        {emoji: '🥋', name: 'martial arts uniform', keywords: 'karate martial'},
        {emoji: '🎽', name: 'running shirt', keywords: 'running sport'},
        {emoji: '🛹', name: 'skateboard', keywords: 'skateboard sport'},
        {emoji: '🛼', name: 'roller skate', keywords: 'rollerblade skate'},
        {emoji: '🛷', name: 'sled', keywords: 'sled winter'},
        {emoji: '⛸️', name: 'ice skate', keywords: 'ice skate winter'},
        {emoji: '🥌', name: 'curling stone', keywords: 'curling sport'},
        {emoji: '🎿', name: 'skis', keywords: 'ski winter sport'},
        {emoji: '⛷️', name: 'skier', keywords: 'ski person winter'},
        {emoji: '🏂', name: 'snowboarder', keywords: 'snowboard winter'},
        {emoji: '🏋️', name: 'person lifting weights', keywords: 'gym weight'},
        {emoji: '🤸', name: 'person cartwheeling', keywords: 'gymnastics cartwheel'},
        {emoji: '🤼', name: 'people wrestling', keywords: 'wrestling sport'},
        {emoji: '🤽', name: 'person playing water polo', keywords: 'water polo'},
        {emoji: '🤾', name: 'person playing handball', keywords: 'handball sport'},
        {emoji: '🤹', name: 'person juggling', keywords: 'juggle circus'},
        {emoji: '🧘', name: 'person in lotus position', keywords: 'yoga meditation'},
        {emoji: '🎪', name: 'circus tent', keywords: 'circus tent'},
        {emoji: '🎭', name: 'performing arts', keywords: 'theater drama'},
        {emoji: '🎨', name: 'artist palette', keywords: 'art paint'},
        {emoji: '🎬', name: 'clapper board', keywords: 'movie film'},
        {emoji: '🎤', name: 'microphone', keywords: 'mic sing'},
        {emoji: '🎧', name: 'headphone', keywords: 'headphones music'},
        {emoji: '🎼', name: 'musical score', keywords: 'music notes'},
        {emoji: '🎹', name: 'musical keyboard', keywords: 'piano music'},
        {emoji: '🥁', name: 'drum', keywords: 'drum music'},
        {emoji: '🪘', name: 'long drum', keywords: 'drum music'},
        {emoji: '🎷', name: 'saxophone', keywords: 'sax music jazz'},
        {emoji: '🎺', name: 'trumpet', keywords: 'trumpet music'},
        {emoji: '🎸', name: 'guitar', keywords: 'guitar music rock'},
        {emoji: '🪕', name: 'banjo', keywords: 'banjo music'},
        {emoji: '🎻', name: 'violin', keywords: 'violin music'},
        {emoji: '🪗', name: 'accordion', keywords: 'accordion music'},
        {emoji: '🎲', name: 'game die', keywords: 'dice game'},
        {emoji: '♟️', name: 'chess pawn', keywords: 'chess game'},
        {emoji: '🎯', name: 'bullseye', keywords: 'target dart'},
        {emoji: '🎳', name: 'bowling', keywords: 'bowling sport'},
        {emoji: '🎮', name: 'video game', keywords: 'game controller'},
        {emoji: '🎰', name: 'slot machine', keywords: 'slot casino'},
        {emoji: '🧩', name: 'puzzle piece', keywords: 'puzzle jigsaw'}
      ],
      travel: [
        {emoji: '🚗', name: 'automobile', keywords: 'car vehicle'},
        {emoji: '🚕', name: 'taxi', keywords: 'taxi cab'},
        {emoji: '🚙', name: 'sport utility vehicle', keywords: 'suv car'},
        {emoji: '🚌', name: 'bus', keywords: 'bus vehicle'},
        {emoji: '🚎', name: 'trolleybus', keywords: 'trolley bus'},
        {emoji: '🏎️', name: 'racing car', keywords: 'race car f1'},
        {emoji: '🚓', name: 'police car', keywords: 'police cop'},
        {emoji: '🚑', name: 'ambulance', keywords: 'ambulance emergency'},
        {emoji: '🚒', name: 'fire engine', keywords: 'fire truck'},
        {emoji: '🚐', name: 'minibus', keywords: 'van vehicle'},
        {emoji: '🛻', name: 'pickup truck', keywords: 'truck pickup'},
        {emoji: '🚚', name: 'delivery truck', keywords: 'truck delivery'},
        {emoji: '🚛', name: 'articulated lorry', keywords: 'truck semi'},
        {emoji: '🚜', name: 'tractor', keywords: 'tractor farm'},
        {emoji: '🦯', name: 'white cane', keywords: 'blind cane'},
        {emoji: '🦽', name: 'manual wheelchair', keywords: 'wheelchair disabled'},
        {emoji: '🦼', name: 'motorized wheelchair', keywords: 'wheelchair electric'},
        {emoji: '🛴', name: 'kick scooter', keywords: 'scooter kick'},
        {emoji: '🚲', name: 'bicycle', keywords: 'bike bicycle'},
        {emoji: '🛵', name: 'motor scooter', keywords: 'scooter motor'},
        {emoji: '🏍️', name: 'motorcycle', keywords: 'motorcycle bike'},
        {emoji: '🛺', name: 'auto rickshaw', keywords: 'rickshaw tuktuk'},
        {emoji: '🚨', name: 'police car light', keywords: 'siren emergency'},
        {emoji: '🚔', name: 'oncoming police car', keywords: 'police car'},
        {emoji: '🚍', name: 'oncoming bus', keywords: 'bus oncoming'},
        {emoji: '🚘', name: 'oncoming automobile', keywords: 'car oncoming'},
        {emoji: '🚖', name: 'oncoming taxi', keywords: 'taxi oncoming'},
        {emoji: '🚡', name: 'aerial tramway', keywords: 'tram cable'},
        {emoji: '🚠', name: 'mountain cableway', keywords: 'cable car'},
        {emoji: '🚟', name: 'suspension railway', keywords: 'suspension train'},
        {emoji: '🚃', name: 'railway car', keywords: 'train car'},
        {emoji: '🚋', name: 'tram car', keywords: 'tram streetcar'},
        {emoji: '🚞', name: 'mountain railway', keywords: 'train mountain'},
        {emoji: '🚝', name: 'monorail', keywords: 'monorail train'},
        {emoji: '🚄', name: 'high-speed train', keywords: 'train fast'},
        {emoji: '🚅', name: 'bullet train', keywords: 'shinkansen train'},
        {emoji: '🚈', name: 'light rail', keywords: 'train light'},
        {emoji: '🚂', name: 'locomotive', keywords: 'train engine'},
        {emoji: '🚆', name: 'train', keywords: 'train railway'},
        {emoji: '🚇', name: 'metro', keywords: 'subway underground'},
        {emoji: '🚊', name: 'tram', keywords: 'tram trolley'},
        {emoji: '🚉', name: 'station', keywords: 'train station'},
        {emoji: '✈️', name: 'airplane', keywords: 'plane fly'},
        {emoji: '🛫', name: 'airplane departure', keywords: 'takeoff plane'},
        {emoji: '🛬', name: 'airplane arrival', keywords: 'landing plane'},
        {emoji: '🛩️', name: 'small airplane', keywords: 'plane small'},
        {emoji: '💺', name: 'seat', keywords: 'seat chair'},
        {emoji: '🚁', name: 'helicopter', keywords: 'helicopter fly'},
        {emoji: '🚟', name: 'suspension railway', keywords: 'suspension train'},
        {emoji: '🚠', name: 'mountain cableway', keywords: 'cable car'},
        {emoji: '🚡', name: 'aerial tramway', keywords: 'tram cable'},
        {emoji: '🛰️', name: 'satellite', keywords: 'satellite space'},
        {emoji: '🚀', name: 'rocket', keywords: 'rocket space'},
        {emoji: '🛸', name: 'flying saucer', keywords: 'ufo alien'},
        {emoji: '🛎️', name: 'bellhop bell', keywords: 'bell hotel'},
        {emoji: '🧳', name: 'luggage', keywords: 'suitcase travel'},
        {emoji: '⌛', name: 'hourglass done', keywords: 'time hourglass'},
        {emoji: '⏳', name: 'hourglass not done', keywords: 'time wait'},
        {emoji: '⌚', name: 'watch', keywords: 'time watch'},
        {emoji: '⏰', name: 'alarm clock', keywords: 'alarm time'},
        {emoji: '⏱️', name: 'stopwatch', keywords: 'time stop'},
        {emoji: '⏲️', name: 'timer clock', keywords: 'timer time'},
        {emoji: '🕰️', name: 'mantelpiece clock', keywords: 'clock time'},
        {emoji: '🕛', name: 'twelve oclock', keywords: 'time 12'},
        {emoji: '🕧', name: 'twelve-thirty', keywords: 'time 12:30'},
        {emoji: '🕐', name: 'one oclock', keywords: 'time 1'},
        {emoji: '🕜', name: 'one-thirty', keywords: 'time 1:30'},
        {emoji: '🕑', name: 'two oclock', keywords: 'time 2'},
        {emoji: '🕝', name: 'two-thirty', keywords: 'time 2:30'},
        {emoji: '🌑', name: 'new moon', keywords: 'moon dark'},
        {emoji: '🌒', name: 'waxing crescent moon', keywords: 'moon night'},
        {emoji: '🌓', name: 'first quarter moon', keywords: 'moon night'},
        {emoji: '🌔', name: 'waxing gibbous moon', keywords: 'moon night'},
        {emoji: '🌕', name: 'full moon', keywords: 'moon night'},
        {emoji: '🌖', name: 'waning gibbous moon', keywords: 'moon night'},
        {emoji: '🌗', name: 'last quarter moon', keywords: 'moon night'},
        {emoji: '🌘', name: 'waning crescent moon', keywords: 'moon night'},
        {emoji: '🌙', name: 'crescent moon', keywords: 'moon night'},
        {emoji: '🌚', name: 'new moon face', keywords: 'moon face'},
        {emoji: '🌛', name: 'first quarter moon face', keywords: 'moon face'},
        {emoji: '🌜', name: 'last quarter moon face', keywords: 'moon face'},
        {emoji: '🌡️', name: 'thermometer', keywords: 'temperature hot'},
        {emoji: '☀️', name: 'sun', keywords: 'sun sunny'},
        {emoji: '🌝', name: 'full moon face', keywords: 'moon face'},
        {emoji: '🌞', name: 'sun with face', keywords: 'sun face'},
        {emoji: '🪐', name: 'ringed planet', keywords: 'saturn planet'},
        {emoji: '⭐', name: 'star', keywords: 'star night'},
        {emoji: '🌟', name: 'glowing star', keywords: 'star bright'},
        {emoji: '🌠', name: 'shooting star', keywords: 'star wish'},
        {emoji: '🌌', name: 'milky way', keywords: 'galaxy space'},
        {emoji: '☁️', name: 'cloud', keywords: 'cloud weather'},
        {emoji: '⛅', name: 'sun behind cloud', keywords: 'cloud sun'},
        {emoji: '⛈️', name: 'cloud with lightning and rain', keywords: 'storm weather'},
        {emoji: '🌤️', name: 'sun behind small cloud', keywords: 'sun cloud'},
        {emoji: '🌥️', name: 'sun behind large cloud', keywords: 'sun cloud'},
        {emoji: '🌦️', name: 'sun behind rain cloud', keywords: 'sun rain'},
        {emoji: '🌧️', name: 'cloud with rain', keywords: 'rain weather'},
        {emoji: '🌨️', name: 'cloud with snow', keywords: 'snow weather'},
        {emoji: '🌩️', name: 'cloud with lightning', keywords: 'lightning storm'},
        {emoji: '🌪️', name: 'tornado', keywords: 'tornado wind'},
        {emoji: '🌫️', name: 'fog', keywords: 'fog weather'},
        {emoji: '🌬️', name: 'wind face', keywords: 'wind blow'},
        {emoji: '🌀', name: 'cyclone', keywords: 'hurricane spiral'},
        {emoji: '🌈', name: 'rainbow', keywords: 'rainbow color'},
        {emoji: '🌂', name: 'closed umbrella', keywords: 'umbrella rain'},
        {emoji: '☂️', name: 'umbrella', keywords: 'umbrella rain'},
        {emoji: '☔', name: 'umbrella with rain drops', keywords: 'umbrella rain'},
        {emoji: '⛱️', name: 'umbrella on ground', keywords: 'beach umbrella'},
        {emoji: '⚡', name: 'high voltage', keywords: 'lightning electric'},
        {emoji: '❄️', name: 'snowflake', keywords: 'snow cold'},
        {emoji: '☃️', name: 'snowman', keywords: 'snow winter'},
        {emoji: '⛄', name: 'snowman without snow', keywords: 'snowman winter'},
        {emoji: '☄️', name: 'comet', keywords: 'comet space'},
        {emoji: '🔥', name: 'fire', keywords: 'fire hot'},
        {emoji: '💧', name: 'droplet', keywords: 'water drop'},
        {emoji: '🌊', name: 'water wave', keywords: 'ocean wave'}
      ],
      objects: [
        {emoji: '📱', name: 'mobile phone', keywords: 'phone smartphone'},
        {emoji: '📲', name: 'mobile phone with arrow', keywords: 'phone call'},
        {emoji: '💻', name: 'laptop', keywords: 'computer laptop'},
        {emoji: '⌨️', name: 'keyboard', keywords: 'keyboard type'},
        {emoji: '🖥️', name: 'desktop computer', keywords: 'computer desktop'},
        {emoji: '🖨️', name: 'printer', keywords: 'printer print'},
        {emoji: '🖱️', name: 'computer mouse', keywords: 'mouse click'},
        {emoji: '🖲️', name: 'trackball', keywords: 'trackball mouse'},
        {emoji: '💽', name: 'computer disk', keywords: 'disk minidisc'},
        {emoji: '💾', name: 'floppy disk', keywords: 'save floppy'},
        {emoji: '💿', name: 'optical disk', keywords: 'cd dvd'},
        {emoji: '📀', name: 'dvd', keywords: 'dvd disk'},
        {emoji: '🧮', name: 'abacus', keywords: 'abacus calculate'},
        {emoji: '🎥', name: 'movie camera', keywords: 'camera film'},
        {emoji: '🎞️', name: 'film frames', keywords: 'film movie'},
        {emoji: '📽️', name: 'film projector', keywords: 'projector movie'},
        {emoji: '🎬', name: 'clapper board', keywords: 'movie action'},
        {emoji: '📺', name: 'television', keywords: 'tv television'},
        {emoji: '📷', name: 'camera', keywords: 'camera photo'},
        {emoji: '📸', name: 'camera with flash', keywords: 'camera flash'},
        {emoji: '📹', name: 'video camera', keywords: 'video record'},
        {emoji: '📼', name: 'videocassette', keywords: 'vhs tape'},
        {emoji: '🔍', name: 'magnifying glass tilted left', keywords: 'search zoom'},
        {emoji: '🔎', name: 'magnifying glass tilted right', keywords: 'search zoom'},
        {emoji: '🕯️', name: 'candle', keywords: 'candle light'},
        {emoji: '💡', name: 'light bulb', keywords: 'idea light'},
        {emoji: '🔦', name: 'flashlight', keywords: 'flashlight torch'},
        {emoji: '🏮', name: 'red paper lantern', keywords: 'lantern light'},
        {emoji: '🪔', name: 'diya lamp', keywords: 'lamp diwali'},
        {emoji: '📔', name: 'notebook with decorative cover', keywords: 'notebook book'},
        {emoji: '📕', name: 'closed book', keywords: 'book red'},
        {emoji: '📖', name: 'open book', keywords: 'book read'},
        {emoji: '📗', name: 'green book', keywords: 'book green'},
        {emoji: '📘', name: 'blue book', keywords: 'book blue'},
        {emoji: '📙', name: 'orange book', keywords: 'book orange'},
        {emoji: '📚', name: 'books', keywords: 'books library'},
        {emoji: '📓', name: 'notebook', keywords: 'notebook journal'},
        {emoji: '📒', name: 'ledger', keywords: 'ledger notebook'},
        {emoji: '📃', name: 'page with curl', keywords: 'page document'},
        {emoji: '📜', name: 'scroll', keywords: 'scroll paper'},
        {emoji: '📄', name: 'page facing up', keywords: 'document page'},
        {emoji: '📰', name: 'newspaper', keywords: 'news paper'},
        {emoji: '🗞️', name: 'rolled-up newspaper', keywords: 'newspaper roll'},
        {emoji: '📑', name: 'bookmark tabs', keywords: 'bookmark tabs'},
        {emoji: '🔖', name: 'bookmark', keywords: 'bookmark tag'},
        {emoji: '🏷️', name: 'label', keywords: 'label tag'},
        {emoji: '💰', name: 'money bag', keywords: 'money bag'},
        {emoji: '🪙', name: 'coin', keywords: 'coin money'},
        {emoji: '💴', name: 'yen banknote', keywords: 'yen money'},
        {emoji: '💵', name: 'dollar banknote', keywords: 'dollar money'},
        {emoji: '💶', name: 'euro banknote', keywords: 'euro money'},
        {emoji: '💷', name: 'pound banknote', keywords: 'pound money'},
        {emoji: '💸', name: 'money with wings', keywords: 'money fly'},
        {emoji: '💳', name: 'credit card', keywords: 'card credit'},
        {emoji: '🧾', name: 'receipt', keywords: 'receipt bill'},
        {emoji: '💹', name: 'chart increasing with yen', keywords: 'chart graph'},
        {emoji: '✉️', name: 'envelope', keywords: 'mail letter'},
        {emoji: '📧', name: 'e-mail', keywords: 'email mail'},
        {emoji: '📨', name: 'incoming envelope', keywords: 'mail receive'},
        {emoji: '📩', name: 'envelope with arrow', keywords: 'mail send'},
        {emoji: '📤', name: 'outbox tray', keywords: 'outbox send'},
        {emoji: '📥', name: 'inbox tray', keywords: 'inbox receive'},
        {emoji: '📦', name: 'package', keywords: 'box package'},
        {emoji: '📫', name: 'closed mailbox with raised flag', keywords: 'mailbox mail'},
        {emoji: '📪', name: 'closed mailbox with lowered flag', keywords: 'mailbox empty'},
        {emoji: '📬', name: 'open mailbox with raised flag', keywords: 'mailbox mail'},
        {emoji: '📭', name: 'open mailbox with lowered flag', keywords: 'mailbox empty'},
        {emoji: '📮', name: 'postbox', keywords: 'postbox mail'},
        {emoji: '🗳️', name: 'ballot box with ballot', keywords: 'vote ballot'},
        {emoji: '✏️', name: 'pencil', keywords: 'pencil write'},
        {emoji: '✒️', name: 'black nib', keywords: 'pen nib'},
        {emoji: '🖋️', name: 'fountain pen', keywords: 'pen fountain'},
        {emoji: '🖊️', name: 'pen', keywords: 'pen ballpoint'},
        {emoji: '🖌️', name: 'paintbrush', keywords: 'paint brush'},
        {emoji: '🖍️', name: 'crayon', keywords: 'crayon draw'},
        {emoji: '📝', name: 'memo', keywords: 'memo note'},
        {emoji: '💼', name: 'briefcase', keywords: 'briefcase work'},
        {emoji: '📁', name: 'file folder', keywords: 'folder file'},
        {emoji: '📂', name: 'open file folder', keywords: 'folder open'},
        {emoji: '🗂️', name: 'card index dividers', keywords: 'index dividers'},
        {emoji: '📅', name: 'calendar', keywords: 'calendar date'},
        {emoji: '📆', name: 'tear-off calendar', keywords: 'calendar date'},
        {emoji: '🗒️', name: 'spiral notepad', keywords: 'notepad spiral'},
        {emoji: '🗓️', name: 'spiral calendar', keywords: 'calendar spiral'},
        {emoji: '📇', name: 'card index', keywords: 'cards index'},
        {emoji: '📈', name: 'chart increasing', keywords: 'chart graph up'},
        {emoji: '📉', name: 'chart decreasing', keywords: 'chart graph down'},
        {emoji: '📊', name: 'bar chart', keywords: 'chart bar'},
        {emoji: '📋', name: 'clipboard', keywords: 'clipboard copy'},
        {emoji: '📌', name: 'pushpin', keywords: 'pin push'},
        {emoji: '📍', name: 'round pushpin', keywords: 'pin location'},
        {emoji: '📎', name: 'paperclip', keywords: 'paperclip attach'},
        {emoji: '🖇️', name: 'linked paperclips', keywords: 'paperclips link'},
        {emoji: '📏', name: 'straight ruler', keywords: 'ruler measure'},
        {emoji: '📐', name: 'triangular ruler', keywords: 'ruler triangle'},
        {emoji: '✂️', name: 'scissors', keywords: 'scissors cut'},
        {emoji: '🗃️', name: 'card file box', keywords: 'file box'},
        {emoji: '🗄️', name: 'file cabinet', keywords: 'cabinet file'},
        {emoji: '🗑️', name: 'wastebasket', keywords: 'trash bin'},
        {emoji: '🔒', name: 'locked', keywords: 'lock locked'},
        {emoji: '🔓', name: 'unlocked', keywords: 'unlock unlocked'},
        {emoji: '🔏', name: 'locked with pen', keywords: 'lock pen'},
        {emoji: '🔐', name: 'locked with key', keywords: 'lock key'},
        {emoji: '🔑', name: 'key', keywords: 'key unlock'},
        {emoji: '🗝️', name: 'old key', keywords: 'key old'},
        {emoji: '🔨', name: 'hammer', keywords: 'hammer tool'},
        {emoji: '🪓', name: 'axe', keywords: 'axe chop'},
        {emoji: '⛏️', name: 'pick', keywords: 'pick mine'},
        {emoji: '⚒️', name: 'hammer and pick', keywords: 'tools work'},
        {emoji: '🛠️', name: 'hammer and wrench', keywords: 'tools fix'},
        {emoji: '🗡️', name: 'dagger', keywords: 'dagger knife'},
        {emoji: '⚔️', name: 'crossed swords', keywords: 'swords battle'},
        {emoji: '💣', name: 'bomb', keywords: 'bomb explode'},
        {emoji: '🪃', name: 'boomerang', keywords: 'boomerang return'},
        {emoji: '🏹', name: 'bow and arrow', keywords: 'bow arrow'},
        {emoji: '🛡️', name: 'shield', keywords: 'shield protect'},
        {emoji: '🪚', name: 'carpentry saw', keywords: 'saw tool'},
        {emoji: '🔧', name: 'wrench', keywords: 'wrench tool'},
        {emoji: '🪛', name: 'screwdriver', keywords: 'screwdriver tool'},
        {emoji: '🔩', name: 'nut and bolt', keywords: 'bolt nut'},
        {emoji: '⚙️', name: 'gear', keywords: 'gear settings'},
        {emoji: '🗜️', name: 'clamp', keywords: 'clamp tool'},
        {emoji: '⚖️', name: 'balance scale', keywords: 'scale justice'},
        {emoji: '🦯', name: 'white cane', keywords: 'cane blind'},
        {emoji: '🔗', name: 'link', keywords: 'link chain'},
        {emoji: '⛓️', name: 'chains', keywords: 'chain link'},
        {emoji: '🪝', name: 'hook', keywords: 'hook catch'},
        {emoji: '🧰', name: 'toolbox', keywords: 'toolbox tools'},
        {emoji: '🧲', name: 'magnet', keywords: 'magnet attract'},
        {emoji: '🪜', name: 'ladder', keywords: 'ladder climb'},
        {emoji: '⚗️', name: 'alembic', keywords: 'chemistry science'},
        {emoji: '🧪', name: 'test tube', keywords: 'test science'},
        {emoji: '🧫', name: 'petri dish', keywords: 'petri science'},
        {emoji: '🧬', name: 'dna', keywords: 'dna genetics'},
        {emoji: '🔬', name: 'microscope', keywords: 'microscope science'},
        {emoji: '🔭', name: 'telescope', keywords: 'telescope stars'},
        {emoji: '📡', name: 'satellite antenna', keywords: 'satellite dish'}
      ],
      symbols: [
        {emoji: '❤️', name: 'red heart', keywords: 'heart love red'},
        {emoji: '🧡', name: 'orange heart', keywords: 'heart love orange'},
        {emoji: '💛', name: 'yellow heart', keywords: 'heart love yellow'},
        {emoji: '💚', name: 'green heart', keywords: 'heart love green'},
        {emoji: '💙', name: 'blue heart', keywords: 'heart love blue'},
        {emoji: '💜', name: 'purple heart', keywords: 'heart love purple'},
        {emoji: '🖤', name: 'black heart', keywords: 'heart black'},
        {emoji: '🤍', name: 'white heart', keywords: 'heart white'},
        {emoji: '🤎', name: 'brown heart', keywords: 'heart brown'},
        {emoji: '💔', name: 'broken heart', keywords: 'heart broken'},
        {emoji: '❤️‍🔥', name: 'heart on fire', keywords: 'heart fire love'},
        {emoji: '❤️‍🩹', name: 'mending heart', keywords: 'heart healing'},
        {emoji: '❣️', name: 'heart exclamation', keywords: 'heart exclamation'},
        {emoji: '💕', name: 'two hearts', keywords: 'hearts love'},
        {emoji: '💞', name: 'revolving hearts', keywords: 'hearts revolving'},
        {emoji: '💓', name: 'beating heart', keywords: 'heart beat'},
        {emoji: '💗', name: 'growing heart', keywords: 'heart growing'},
        {emoji: '💖', name: 'sparkling heart', keywords: 'heart sparkle'},
        {emoji: '💘', name: 'heart with arrow', keywords: 'heart cupid'},
        {emoji: '💝', name: 'heart with ribbon', keywords: 'heart gift'},
        {emoji: '💟', name: 'heart decoration', keywords: 'heart decoration'},
        {emoji: '☮️', name: 'peace symbol', keywords: 'peace symbol'},
        {emoji: '✝️', name: 'latin cross', keywords: 'cross christian'},
        {emoji: '☪️', name: 'star and crescent', keywords: 'islam muslim'},
        {emoji: '🕉️', name: 'om', keywords: 'om hindu'},
        {emoji: '☸️', name: 'wheel of dharma', keywords: 'dharma buddhist'},
        {emoji: '✡️', name: 'star of david', keywords: 'star david jewish'},
        {emoji: '🔯', name: 'dotted six-pointed star', keywords: 'star six'},
        {emoji: '🕎', name: 'menorah', keywords: 'menorah jewish'},
        {emoji: '☯️', name: 'yin yang', keywords: 'yin yang balance'},
        {emoji: '☦️', name: 'orthodox cross', keywords: 'cross orthodox'},
        {emoji: '🛐', name: 'place of worship', keywords: 'worship pray'},
        {emoji: '⛎', name: 'ophiuchus', keywords: 'ophiuchus zodiac'},
        {emoji: '♈', name: 'aries', keywords: 'aries zodiac'},
        {emoji: '♉', name: 'taurus', keywords: 'taurus zodiac'},
        {emoji: '♊', name: 'gemini', keywords: 'gemini zodiac'},
        {emoji: '♋', name: 'cancer', keywords: 'cancer zodiac'},
        {emoji: '♌', name: 'leo', keywords: 'leo zodiac'},
        {emoji: '♍', name: 'virgo', keywords: 'virgo zodiac'},
        {emoji: '♎', name: 'libra', keywords: 'libra zodiac'},
        {emoji: '♏', name: 'scorpio', keywords: 'scorpio zodiac'},
        {emoji: '♐', name: 'sagittarius', keywords: 'sagittarius zodiac'},
        {emoji: '♑', name: 'capricorn', keywords: 'capricorn zodiac'},
        {emoji: '♒', name: 'aquarius', keywords: 'aquarius zodiac'},
        {emoji: '♓', name: 'pisces', keywords: 'pisces zodiac'},
        {emoji: '🆔', name: 'ID button', keywords: 'id identification'},
        {emoji: '⚛️', name: 'atom symbol', keywords: 'atom science'},
        {emoji: '🉑', name: 'japanese acceptable button', keywords: 'accept japanese'},
        {emoji: '☢️', name: 'radioactive', keywords: 'radioactive nuclear'},
        {emoji: '☣️', name: 'biohazard', keywords: 'biohazard danger'},
        {emoji: '📴', name: 'mobile phone off', keywords: 'phone off'},
        {emoji: '📳', name: 'vibration mode', keywords: 'phone vibrate'},
        {emoji: '🈶', name: 'japanese not free of charge button', keywords: 'japanese charge'},
        {emoji: '🈚', name: 'japanese free of charge button', keywords: 'japanese free'},
        {emoji: '🈸', name: 'japanese application button', keywords: 'japanese application'},
        {emoji: '🈺', name: 'japanese open for business button', keywords: 'japanese open'},
        {emoji: '🈷️', name: 'japanese monthly amount button', keywords: 'japanese month'},
        {emoji: '✴️', name: 'eight-pointed star', keywords: 'star eight'},
        {emoji: '🆚', name: 'VS button', keywords: 'vs versus'},
        {emoji: '💮', name: 'white flower', keywords: 'flower stamp'},
        {emoji: '🉐', name: 'japanese bargain button', keywords: 'japanese bargain'},
        {emoji: '㊙️', name: 'japanese secret button', keywords: 'secret japanese'},
        {emoji: '㊗️', name: 'japanese congratulations button', keywords: 'congratulations japanese'},
        {emoji: '🈴', name: 'japanese passing grade button', keywords: 'japanese pass'},
        {emoji: '🈵', name: 'japanese no vacancy button', keywords: 'japanese full'},
        {emoji: '🈹', name: 'japanese discount button', keywords: 'japanese discount'},
        {emoji: '🈲', name: 'japanese prohibited button', keywords: 'japanese prohibited'},
        {emoji: '🅰️', name: 'A button (blood type)', keywords: 'a blood type'},
        {emoji: '🅱️', name: 'B button (blood type)', keywords: 'b blood type'},
        {emoji: '🆎', name: 'AB button (blood type)', keywords: 'ab blood type'},
        {emoji: '🆑', name: 'CL button', keywords: 'cl clear'},
        {emoji: '🅾️', name: 'O button (blood type)', keywords: 'o blood type'},
        {emoji: '🆘', name: 'SOS button', keywords: 'sos help'},
        {emoji: '❌', name: 'cross mark', keywords: 'x wrong no'},
        {emoji: '⭕', name: 'hollow red circle', keywords: 'circle o red'},
        {emoji: '🛑', name: 'stop sign', keywords: 'stop sign'},
        {emoji: '⛔', name: 'no entry', keywords: 'no entry forbidden'},
        {emoji: '📛', name: 'name badge', keywords: 'name badge'},
        {emoji: '🚫', name: 'prohibited', keywords: 'no forbidden'},
        {emoji: '💯', name: 'hundred points', keywords: '100 perfect'},
        {emoji: '💢', name: 'anger symbol', keywords: 'anger mad'},
        {emoji: '♨️', name: 'hot springs', keywords: 'hot springs'},
        {emoji: '🚷', name: 'no pedestrians', keywords: 'no walk'},
        {emoji: '🚯', name: 'no littering', keywords: 'no litter'},
        {emoji: '🚳', name: 'no bicycles', keywords: 'no bike'},
        {emoji: '🚱', name: 'non-potable water', keywords: 'no water'},
        {emoji: '🔞', name: 'no one under eighteen', keywords: '18 adult'},
        {emoji: '📵', name: 'no mobile phones', keywords: 'no phone'},
        {emoji: '🚭', name: 'no smoking', keywords: 'no smoking'},
        {emoji: '❗', name: 'exclamation mark', keywords: 'exclamation important'},
        {emoji: '❕', name: 'white exclamation mark', keywords: 'exclamation white'},
        {emoji: '❓', name: 'question mark', keywords: 'question ask'},
        {emoji: '❔', name: 'white question mark', keywords: 'question white'},
        {emoji: '‼️', name: 'double exclamation mark', keywords: 'exclamation double'},
        {emoji: '⁉️', name: 'exclamation question mark', keywords: 'exclamation question'},
        {emoji: '🔅', name: 'dim button', keywords: 'brightness low'},
        {emoji: '🔆', name: 'bright button', keywords: 'brightness high'},
        {emoji: '〽️', name: 'part alternation mark', keywords: 'mark part'},
        {emoji: '⚠️', name: 'warning', keywords: 'warning caution'},
        {emoji: '🚸', name: 'children crossing', keywords: 'children crossing'},
        {emoji: '🔱', name: 'trident emblem', keywords: 'trident weapon'},
        {emoji: '⚜️', name: 'fleur-de-lis', keywords: 'fleur de lis'},
        {emoji: '🔰', name: 'japanese symbol for beginner', keywords: 'beginner japanese'},
        {emoji: '♻️', name: 'recycling symbol', keywords: 'recycle environment'},
        {emoji: '✅', name: 'check mark button', keywords: 'check mark yes'},
        {emoji: '🈯', name: 'japanese reserved button', keywords: 'japanese reserved'},
        {emoji: '💹', name: 'chart increasing with yen', keywords: 'chart yen'},
        {emoji: '❇️', name: 'sparkle', keywords: 'sparkle star'},
        {emoji: '✳️', name: 'eight-spoked asterisk', keywords: 'asterisk star'},
        {emoji: '❎', name: 'cross mark button', keywords: 'x no cross'},
        {emoji: '🌐', name: 'globe with meridians', keywords: 'globe world'},
        {emoji: '💠', name: 'diamond with a dot', keywords: 'diamond cute'},
        {emoji: 'Ⓜ️', name: 'circled M', keywords: 'm metro'},
        {emoji: '🌀', name: 'cyclone', keywords: 'cyclone spiral'},
        {emoji: '💤', name: 'zzz', keywords: 'sleep zzz'},
        {emoji: '🏧', name: 'ATM sign', keywords: 'atm money'},
        {emoji: '🚾', name: 'water closet', keywords: 'wc toilet'},
        {emoji: '♿', name: 'wheelchair symbol', keywords: 'wheelchair accessible'},
        {emoji: '🅿️', name: 'P button', keywords: 'parking p'},
        {emoji: '🛗', name: 'elevator', keywords: 'elevator lift'},
        {emoji: '🈳', name: 'japanese vacancy button', keywords: 'japanese vacant'},
        {emoji: '🈂️', name: 'japanese service charge button', keywords: 'japanese service'},
        {emoji: '🛂', name: 'passport control', keywords: 'passport control'},
        {emoji: '🛃', name: 'customs', keywords: 'customs border'},
        {emoji: '🛄', name: 'baggage claim', keywords: 'baggage luggage'},
        {emoji: '🛅', name: 'left luggage', keywords: 'luggage locker'},
        {emoji: '🚹', name: 'mens room', keywords: 'men restroom'},
        {emoji: '🚺', name: 'womens room', keywords: 'women restroom'},
        {emoji: '🚼', name: 'baby symbol', keywords: 'baby change'},
        {emoji: '⚧️', name: 'transgender symbol', keywords: 'transgender gender'},
        {emoji: '🚻', name: 'restroom', keywords: 'restroom toilet'},
        {emoji: '🚮', name: 'litter in bin sign', keywords: 'litter trash'},
        {emoji: '🎦', name: 'cinema', keywords: 'cinema movie'},
        {emoji: '📶', name: 'antenna bars', keywords: 'signal bars'},
        {emoji: '🈁', name: 'japanese here button', keywords: 'japanese here'},
        {emoji: '🔣', name: 'input symbols', keywords: 'symbols input'},
        {emoji: '🆖', name: 'NG button', keywords: 'ng no good'},
        {emoji: '🆗', name: 'OK button', keywords: 'ok okay'},
        {emoji: '🆙', name: 'UP! button', keywords: 'up level'},
        {emoji: '🆒', name: 'COOL button', keywords: 'cool nice'},
        {emoji: '🆕', name: 'NEW button', keywords: 'new fresh'},
        {emoji: '🆓', name: 'FREE button', keywords: 'free gratis'},
        {emoji: '0️⃣', name: 'keycap 0', keywords: 'zero 0 number'},
        {emoji: '1️⃣', name: 'keycap 1', keywords: 'one 1 number'},
        {emoji: '2️⃣', name: 'keycap 2', keywords: 'two 2 number'},
        {emoji: '3️⃣', name: 'keycap 3', keywords: 'three 3 number'},
        {emoji: '4️⃣', name: 'keycap 4', keywords: 'four 4 number'},
        {emoji: '5️⃣', name: 'keycap 5', keywords: 'five 5 number'},
        {emoji: '6️⃣', name: 'keycap 6', keywords: 'six 6 number'},
        {emoji: '7️⃣', name: 'keycap 7', keywords: 'seven 7 number'},
        {emoji: '8️⃣', name: 'keycap 8', keywords: 'eight 8 number'},
        {emoji: '9️⃣', name: 'keycap 9', keywords: 'nine 9 number'},
        {emoji: '🔟', name: 'keycap 10', keywords: 'ten 10 number'},
        {emoji: '🔢', name: 'input numbers', keywords: 'numbers 123'},
        {emoji: '#️⃣', name: 'keycap #', keywords: 'hash pound'},
        {emoji: '*️⃣', name: 'keycap *', keywords: 'asterisk star'},
        {emoji: '⏏️', name: 'eject button', keywords: 'eject'},
        {emoji: '▶️', name: 'play button', keywords: 'play arrow'},
        {emoji: '⏸️', name: 'pause button', keywords: 'pause'},
        {emoji: '⏯️', name: 'play or pause button', keywords: 'play pause'},
        {emoji: '⏹️', name: 'stop button', keywords: 'stop square'},
        {emoji: '⏺️', name: 'record button', keywords: 'record circle'},
        {emoji: '⏭️', name: 'next track button', keywords: 'next skip'},
        {emoji: '⏮️', name: 'last track button', keywords: 'previous back'},
        {emoji: '⏩', name: 'fast-forward button', keywords: 'fast forward'},
        {emoji: '⏪', name: 'fast reverse button', keywords: 'rewind back'},
        {emoji: '⏫', name: 'fast up button', keywords: 'up fast'},
        {emoji: '⏬', name: 'fast down button', keywords: 'down fast'},
        {emoji: '◀️', name: 'reverse button', keywords: 'back arrow'},
        {emoji: '🔼', name: 'upwards button', keywords: 'up triangle'},
        {emoji: '🔽', name: 'downwards button', keywords: 'down triangle'},
        {emoji: '➡️', name: 'right arrow', keywords: 'right arrow'},
        {emoji: '⬅️', name: 'left arrow', keywords: 'left arrow'},
        {emoji: '⬆️', name: 'up arrow', keywords: 'up arrow'},
        {emoji: '⬇️', name: 'down arrow', keywords: 'down arrow'},
        {emoji: '↗️', name: 'up-right arrow', keywords: 'arrow diagonal'},
        {emoji: '↘️', name: 'down-right arrow', keywords: 'arrow diagonal'},
        {emoji: '↙️', name: 'down-left arrow', keywords: 'arrow diagonal'},
        {emoji: '↖️', name: 'up-left arrow', keywords: 'arrow diagonal'},
        {emoji: '↕️', name: 'up-down arrow', keywords: 'arrow vertical'},
        {emoji: '↔️', name: 'left-right arrow', keywords: 'arrow horizontal'},
        {emoji: '↪️', name: 'left arrow curving right', keywords: 'arrow turn'},
        {emoji: '↩️', name: 'right arrow curving left', keywords: 'arrow return'},
        {emoji: '⤴️', name: 'right arrow curving up', keywords: 'arrow up'},
        {emoji: '⤵️', name: 'right arrow curving down', keywords: 'arrow down'},
        {emoji: '🔀', name: 'shuffle tracks button', keywords: 'shuffle random'},
        {emoji: '🔁', name: 'repeat button', keywords: 'repeat loop'},
        {emoji: '🔂', name: 'repeat single button', keywords: 'repeat one'},
        {emoji: '🔄', name: 'counterclockwise arrows button', keywords: 'refresh reload'},
        {emoji: '🔃', name: 'clockwise vertical arrows', keywords: 'refresh clockwise'},
        {emoji: '🎵', name: 'musical note', keywords: 'music note'},
        {emoji: '🎶', name: 'musical notes', keywords: 'music notes'},
        {emoji: '➕', name: 'plus', keywords: 'plus add'},
        {emoji: '➖', name: 'minus', keywords: 'minus subtract'},
        {emoji: '➗', name: 'divide', keywords: 'divide division'},
        {emoji: '✖️', name: 'multiply', keywords: 'multiply times'},
        {emoji: '♾️', name: 'infinity', keywords: 'infinity forever'},
        {emoji: '💲', name: 'heavy dollar sign', keywords: 'dollar money'},
        {emoji: '💱', name: 'currency exchange', keywords: 'currency exchange'},
        {emoji: '™️', name: 'trade mark', keywords: 'trademark tm'},
        {emoji: '©️', name: 'copyright', keywords: 'copyright c'},
        {emoji: '®️', name: 'registered', keywords: 'registered r'},
        {emoji: '〰️', name: 'wavy dash', keywords: 'wavy dash'},
        {emoji: '➰', name: 'curly loop', keywords: 'loop curly'},
        {emoji: '➿', name: 'double curly loop', keywords: 'loop double'},
        {emoji: '🔚', name: 'END arrow', keywords: 'end arrow'},
        {emoji: '🔙', name: 'BACK arrow', keywords: 'back arrow'},
        {emoji: '🔛', name: 'ON! arrow', keywords: 'on arrow'},
        {emoji: '🔝', name: 'TOP arrow', keywords: 'top arrow'},
        {emoji: '🔜', name: 'SOON arrow', keywords: 'soon arrow'},
        {emoji: '✔️', name: 'check mark', keywords: 'check mark yes'},
        {emoji: '☑️', name: 'check box with check', keywords: 'checkbox check'},
        {emoji: '🔘', name: 'radio button', keywords: 'radio button'},
        {emoji: '🔴', name: 'red circle', keywords: 'red circle'},
        {emoji: '🟠', name: 'orange circle', keywords: 'orange circle'},
        {emoji: '🟡', name: 'yellow circle', keywords: 'yellow circle'},
        {emoji: '🟢', name: 'green circle', keywords: 'green circle'},
        {emoji: '🔵', name: 'blue circle', keywords: 'blue circle'},
        {emoji: '🟣', name: 'purple circle', keywords: 'purple circle'},
        {emoji: '⚫', name: 'black circle', keywords: 'black circle'},
        {emoji: '⚪', name: 'white circle', keywords: 'white circle'},
        {emoji: '🟤', name: 'brown circle', keywords: 'brown circle'},
        {emoji: '🔺', name: 'red triangle pointed up', keywords: 'red triangle up'},
        {emoji: '🔻', name: 'red triangle pointed down', keywords: 'red triangle down'},
        {emoji: '🔸', name: 'small orange diamond', keywords: 'orange diamond small'},
        {emoji: '🔹', name: 'small blue diamond', keywords: 'blue diamond small'},
        {emoji: '🔶', name: 'large orange diamond', keywords: 'orange diamond large'},
        {emoji: '🔷', name: 'large blue diamond', keywords: 'blue diamond large'},
        {emoji: '🔳', name: 'white square button', keywords: 'white square'},
        {emoji: '🔲', name: 'black square button', keywords: 'black square'},
        {emoji: '▪️', name: 'black small square', keywords: 'black square small'},
        {emoji: '▫️', name: 'white small square', keywords: 'white square small'},
        {emoji: '◾', name: 'black medium-small square', keywords: 'black square medium'},
        {emoji: '◽', name: 'white medium-small square', keywords: 'white square medium'},
        {emoji: '◼️', name: 'black medium square', keywords: 'black square medium'},
        {emoji: '◻️', name: 'white medium square', keywords: 'white square medium'},
        {emoji: '⬛', name: 'black large square', keywords: 'black square large'},
        {emoji: '⬜', name: 'white large square', keywords: 'white square large'},
        {emoji: '🟥', name: 'red square', keywords: 'red square'},
        {emoji: '🟧', name: 'orange square', keywords: 'orange square'},
        {emoji: '🟨', name: 'yellow square', keywords: 'yellow square'},
        {emoji: '🟩', name: 'green square', keywords: 'green square'},
        {emoji: '🟦', name: 'blue square', keywords: 'blue square'},
        {emoji: '🟪', name: 'purple square', keywords: 'purple square'},
        {emoji: '🟫', name: 'brown square', keywords: 'brown square'},
        {emoji: '⬛', name: 'black large square', keywords: 'black square large'},
        {emoji: '⬜', name: 'white large square', keywords: 'white square large'},
        {emoji: '🔈', name: 'speaker low volume', keywords: 'speaker volume low'},
        {emoji: '🔉', name: 'speaker medium volume', keywords: 'speaker volume medium'},
        {emoji: '🔊', name: 'speaker high volume', keywords: 'speaker volume high'},
        {emoji: '🔇', name: 'muted speaker', keywords: 'speaker mute'},
        {emoji: '📣', name: 'megaphone', keywords: 'megaphone loud'},
        {emoji: '📢', name: 'loudspeaker', keywords: 'loudspeaker announcement'},
        {emoji: '👁‍🗨', name: 'eye in speech bubble', keywords: 'eye speech witness'},
        {emoji: '💬', name: 'speech balloon', keywords: 'speech talk'},
        {emoji: '💭', name: 'thought balloon', keywords: 'thought think'},
        {emoji: '🗯️', name: 'right anger bubble', keywords: 'anger bubble'},
        {emoji: '♠️', name: 'spade suit', keywords: 'spades cards'},
        {emoji: '♣️', name: 'club suit', keywords: 'clubs cards'},
        {emoji: '♥️', name: 'heart suit', keywords: 'hearts cards'},
        {emoji: '♦️', name: 'diamond suit', keywords: 'diamonds cards'},
        {emoji: '🃏', name: 'joker', keywords: 'joker cards'},
        {emoji: '🎴', name: 'flower playing cards', keywords: 'cards hanafuda'},
        {emoji: '🀄', name: 'mahjong red dragon', keywords: 'mahjong dragon'},
        {emoji: '🕐', name: 'one oclock', keywords: 'clock 1'},
        {emoji: '🕑', name: 'two oclock', keywords: 'clock 2'},
        {emoji: '🕒', name: 'three oclock', keywords: 'clock 3'},
        {emoji: '🕓', name: 'four oclock', keywords: 'clock 4'},
        {emoji: '🕔', name: 'five oclock', keywords: 'clock 5'},
        {emoji: '🕕', name: 'six oclock', keywords: 'clock 6'},
        {emoji: '🕖', name: 'seven oclock', keywords: 'clock 7'},
        {emoji: '🕗', name: 'eight oclock', keywords: 'clock 8'},
        {emoji: '🕘', name: 'nine oclock', keywords: 'clock 9'},
        {emoji: '🕙', name: 'ten oclock', keywords: 'clock 10'},
        {emoji: '🕚', name: 'eleven oclock', keywords: 'clock 11'},
        {emoji: '🕛', name: 'twelve oclock', keywords: 'clock 12'},
        {emoji: '🕜', name: 'one-thirty', keywords: 'clock 1:30'},
        {emoji: '🕝', name: 'two-thirty', keywords: 'clock 2:30'},
        {emoji: '🕞', name: 'three-thirty', keywords: 'clock 3:30'},
        {emoji: '🕟', name: 'four-thirty', keywords: 'clock 4:30'},
        {emoji: '🕠', name: 'five-thirty', keywords: 'clock 5:30'},
        {emoji: '🕡', name: 'six-thirty', keywords: 'clock 6:30'},
        {emoji: '🕢', name: 'seven-thirty', keywords: 'clock 7:30'},
        {emoji: '🕣', name: 'eight-thirty', keywords: 'clock 8:30'},
        {emoji: '🕤', name: 'nine-thirty', keywords: 'clock 9:30'},
        {emoji: '🕥', name: 'ten-thirty', keywords: 'clock 10:30'},
        {emoji: '🕦', name: 'eleven-thirty', keywords: 'clock 11:30'},
        {emoji: '🕧', name: 'twelve-thirty', keywords: 'clock 12:30'}
      ]
    };
  }

  init() {
    this.createPickerElement();
    this.attachEventListeners();
  }

  createPickerElement() {
    // Create the picker HTML structure
    const pickerHTML = `
      <div class="emoji-picker" id="emojiPicker">
        <input type="text" class="emoji-search" id="emojiSearch" placeholder="Search emojis...">
        <div class="emoji-categories" id="emojiCategories">
          <div class="emoji-category active" data-category="all">All</div>
          <div class="emoji-category" data-category="smileys">😊</div>
          <div class="emoji-category" data-category="people">👋</div>
          <div class="emoji-category" data-category="nature">🌸</div>
          <div class="emoji-category" data-category="food">🍕</div>
          <div class="emoji-category" data-category="activities">⚽</div>
          <div class="emoji-category" data-category="travel">✈️</div>
          <div class="emoji-category" data-category="objects">💡</div>
          <div class="emoji-category" data-category="symbols">❤️</div>
        </div>
        <div class="emoji-grid" id="emojiGrid"></div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', pickerHTML);
    
    // Store references
    this.picker = document.getElementById('emojiPicker');
    this.searchInput = document.getElementById('emojiSearch');
    this.grid = document.getElementById('emojiGrid');
    this.categories = document.getElementById('emojiCategories');
  }

  attachEventListeners() {
    // Search functionality
    this.searchInput.addEventListener('input', (e) => {
      const activeCategory = document.querySelector('.emoji-category.active').dataset.category;
      this.filterEmojis(e.target.value, activeCategory);
      this.selectedIndex = 0;
      this.updateSelectedEmoji();
    });

    // Category selection
    this.categories.addEventListener('click', (e) => {
      if (e.target.classList.contains('emoji-category')) {
        document.querySelectorAll('.emoji-category').forEach(cat => cat.classList.remove('active'));
        e.target.classList.add('active');
        this.filterEmojis(this.searchInput.value, e.target.dataset.category);
        this.selectedIndex = 0;
        this.updateSelectedEmoji();
      }
    });

    // Emoji selection
    this.grid.addEventListener('click', (e) => {
      if (e.target.classList.contains('emoji-item')) {
        this.insertEmoji(e.target.dataset.emoji);
      }
    });

    // Keyboard navigation
    this.picker.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));

    // Close picker when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.picker.contains(e.target)) {
        this.hide();
      }
    });
  }

  handleKeyboardNavigation(e) {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        this.selectedIndex = Math.max(0, this.selectedIndex - 1);
        this.updateSelectedEmoji();
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.selectedIndex = Math.min(this.filteredEmojis.length - 1, this.selectedIndex + 1);
        this.updateSelectedEmoji();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.selectedIndex = Math.max(0, this.selectedIndex - 8);
        this.updateSelectedEmoji();
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.selectedIndex = Math.min(this.filteredEmojis.length - 1, this.selectedIndex + 8);
        this.updateSelectedEmoji();
        break;
      case 'Enter':
        e.preventDefault();
        if (this.filteredEmojis[this.selectedIndex]) {
          this.insertEmoji(this.filteredEmojis[this.selectedIndex].emoji);
        }
        break;
      case 'Escape':
        e.preventDefault();
        this.hide();
        break;
    }
  }

  show(x, y, searchTerm = '') {
    this.picker.style.left = x + 'px';
    this.picker.style.top = y + 'px';
    this.picker.style.display = 'block';
    
    this.searchInput.value = searchTerm;
    this.filterEmojis(searchTerm);
    this.searchInput.focus();
    this.selectedIndex = 0;
    this.updateSelectedEmoji();
  }

  hide() {
    this.picker.style.display = 'none';
    this.currentTarget = null;
    this.triggerPosition = null;
  }

  getAllEmojis() {
    return Object.values(this.emojis).flat();
  }

  filterEmojis(searchTerm = '', category = 'all') {
    let emojiList = category === 'all' ? this.getAllEmojis() : this.emojis[category] || [];
    
    if (searchTerm) {
      emojiList = emojiList.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.keywords.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    this.filteredEmojis = emojiList.slice(0, 48); // Limit to 48 emojis
    this.renderGrid();
  }

  renderGrid() {
    this.grid.innerHTML = this.filteredEmojis.map((item, index) => 
      `<div class="emoji-item ${index === this.selectedIndex ? 'selected' : ''}" 
            data-emoji="${item.emoji}" 
            data-index="${index}"
            title="${item.name}">
         ${item.emoji}
       </div>`
    ).join('');
  }

  updateSelectedEmoji() {
    document.querySelectorAll('.emoji-item').forEach((item, index) => {
      item.classList.toggle('selected', index === this.selectedIndex);
    });
  }

  insertEmoji(emoji) {
    if (!this.currentTarget || !this.triggerPosition) return;
    
    const target = this.currentTarget;
    const value = target.value;
    const before = value.substring(0, this.triggerPosition.start);
    const after = value.substring(this.triggerPosition.end);
    
    target.value = before + emoji + ' ' + after;
    
    // Set cursor position after emoji
    const newPosition = this.triggerPosition.start + emoji.length + 1;
    target.setSelectionRange(newPosition, newPosition);
    target.focus();
    
    // Trigger input event for any listeners
    target.dispatchEvent(new Event('input', { bubbles: true }));
    
    this.hide();
  }

  // Set up trigger detection on a textarea or input
  setupTriggerDetection(element) {
    element.addEventListener('input', (e) => {
      // Disable colon emoji trigger on mobile - use native keyboard emoji instead
      if (this.isMobile()) {
        return;
      }
      
      const cursorPos = element.selectionStart;
      const text = element.value;
      
      // Check if we just typed `:` and it's preceded by whitespace or start of line (original trigger)
      if (text[cursorPos - 1] === ':' && 
          (cursorPos === 1 || /\s/.test(text[cursorPos - 2]))) {
          this.currentTarget = element;
          this.triggerPosition = {
            start: cursorPos - 1,
            end: cursorPos
          };
          
          // Calculate position for picker
          const rect = element.getBoundingClientRect();
          const lineHeight = 20;
          const charWidth = 8;
          
          const lines = text.substring(0, cursorPos).split('\n');
          const currentLine = lines.length - 1;
          const currentCol = lines[lines.length - 1].length;
          
          const x = rect.left + (currentCol * charWidth);
          const y = rect.top + (currentLine * lineHeight) + 25;
          
          this.show(x, y);
        }
      }
    });

    // Handle search as you type in editor (separate listener for continuation)
    const searchHandler = (e) => {
      if (!this.currentTarget || !this.triggerPosition || this.currentTarget !== element) return;
      
      const cursorPos = element.selectionStart;
      const text = element.value;
      
      // Check if cursor is still after our trigger
      if (cursorPos < this.triggerPosition.start) {
        this.hide();
        return;
      }
      
      // Extract search term after `:`
      const searchStart = this.triggerPosition.start + 1;
      const searchText = text.substring(searchStart, cursorPos);
      
      // If user typed space or newline, hide picker
      if (/\s/.test(searchText)) {
        this.hide();
        return;
      }
      
      // Update trigger end position
      this.triggerPosition.end = cursorPos;
      
      // Filter emojis based on search text
      const activeCategory = document.querySelector('.emoji-category.active')?.dataset.category || 'all';
      this.filterEmojis(searchText, activeCategory);
      this.selectedIndex = 0;
      this.updateSelectedEmoji();
      this.searchInput.value = searchText;
    };

    // Add second listener for search continuation
    element.addEventListener('input', searchHandler);

    // Handle backspace to close picker if we delete the `:`
    const backspaceHandler = (e) => {
      if (e.key === 'Backspace' && this.currentTarget && this.triggerPosition) {
        setTimeout(() => {
          if (this.currentTarget === element) {
            const cursorPos = element.selectionStart;
            if (cursorPos <= this.triggerPosition.start) {
              this.hide();
            }
          }
        }, 10);
      }
    };

    element.addEventListener('keydown', backspaceHandler);
  }
  
  // Mobile detection for revolutionary UX optimization
  isMobile() {
    if (this._isMobile === null) {
      this._isMobile = window.innerWidth <= 768 || 
                      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    return this._isMobile;
  }
}