import {
  Ambulance, Anchor, Atom, Axe, Baby, Banknote, Beaker, Bed, Bike, Binoculars,
  Bird, BookOpen, Bot, Brain, Briefcase, Building2, Bus, Cake, Camera, Car, Castle,
  ChefHat, Church, Coffee, Cog, Compass, Container, Crown, Dices, Drama,
  Dumbbell, Factory, Feather, Fish, FlaskConical, Flame, Gamepad2, Gavel, GraduationCap,
  Hammer, Handshake, Home, Landmark, Library, Luggage, Mailbox, Map, Martini, Medal,
  Microscope, Mountain, Music, Newspaper, Orbit, Palette, PawPrint, Phone, Pickaxe, Pizza,
  Plane, Podcast, Popcorn, Presentation, Puzzle, Radiation, Rocket, Sailboat, Scale,
  Scissors, Scroll, Shield, Ship, ShoppingCart, Shovel, Siren, Skull, Snowflake, Soup,
  Sprout, Stethoscope, Store, Swords, Syringe, Telescope, Tent, Tractor, Train, Trees,
  Trophy, Tv, Users, Utensils, Vote, Warehouse, Waves, Wheat, Wifi, Wind, Wine, Wrench,
  type LucideIcon
} from 'lucide-react';

/**
 * Picks a thematic icon for a Spyfall location.
 *
 * Rules are matched against the location id in order and the first hit wins,
 * so **specific patterns must sit above broad ones**. That ordering is the
 * whole design: an earlier draft put the category rules first and Sci-Fi
 * collapsed to five icons across 22 locations, because everything matched
 * `/space|lunar|mars/` before it could reach anything more precise.
 *
 * Anything unmatched falls back to its pack's icon, so a new location never
 * renders blank — it just gets a less specific symbol until a rule is added.
 */

const RULES: [RegExp, LucideIcon][] = [
  /* ---------------------------------------------------------------- *
   * Named locations first — these would otherwise be swallowed by a
   * broader category rule further down.
   * ---------------------------------------------------------------- */
  [/cyberpunkbar|speakeasy|nightclub|sportsbar/, Martini],
  [/alienmarket|gameshop|bookstore|flowershop|gastronom|malltee/, Store],
  [/asteroidmine|goldrush|^mine$/, Pickaxe],
  [/robotfactory|aicore/, Bot],
  [/cloninglab|timelab|neuralclinic/, Atom],
  [/orbitalhotel|icehotel|roadmotel|motelus|hostel/, Bed],
  [/domecity|officelift|adminbuilding|coworking/, Building2],
  [/bunkerfuture|gunrange|militarydept/, Shield],
  [/cryobay|glacier|skiresort/, Snowflake],
  [/firstcontact|teambuilding|corporate|devconf|conference|parentsmeeting/, Handshake],
  [/terraforming|greenhouse|kolkhoz|vineyard|sheepfarm|dacha|bambooforest/, Sprout],
  [/droneport|vrworld|vrclub|remotecall/, Wifi],
  [/spacestation|marscolony|generation_ship|lunarbase|spaceport|teleportstation/, Rocket],
  [/satellite|orbit/, Orbit],

  [/kitchenette|cateringkitchen|unihostelkitchen|canteenschoolfood/, ChefHat],
  [/serverroom|computerclub|computerroom|itroom|qaroom|gamedev|modding/, Cog],
  [/callcenter/, Phone],
  [/accounting|scholarshipday|ochered/, Banknote],
  [/designstudio|artroom/, Palette],
  [/officeaudit|courthouse|courtroomus|inquisition/, Scale],
  [/smokearea|windmill|meteostation/, Wind],
  [/printerroom|printshop|newsroom/, Newspaper],
  [/warehouse|garazh/, Warehouse],
  [/salesdept|marketplace|foodmarket|fishmarket|bazaar/, ShoppingCart],
  [/interview|hrroom|studentclub|erasmus/, Users],

  [/chessclub|chessmatch/, Crown],
  [/boardgameclub|pokershow|bettingshop|lasvegas/, Dices],
  [/questroom|speedrun/, Puzzle],
  [/kidsplayroom|summercamp|detention/, Baby],
  [/retroexpo|drivein|kino|cinema/, Tv],
  [/streamroom|nightradio|radiostation|recording/, Podcast],
  [/cosplay|theatre|circus|dvorec|assembly|graduation/, Drama],
  [/esports|arcade|lanparty|tournament|mmoguild/, Gamepad2],

  [/olympics|marathon|rodeo|doping/, Medal],
  [/velodrome|skatepark/, Bike],
  [/rowing|divingboat|ferry|cruise|sailboat/, Sailboat],
  [/boxinggym|wrestlinghall|dojo|fencing|rallystage/, Swords],
  [/stadium|hockey|tennis|golf|basketball|baseball|gymnastics|sportsekcia|lockerroomsport/, Trophy],
  [/gymhall|unigym|climbinggym|poolswim|^gym$/, Dumbbell],

  [/pyramid|colosseum|agora|mayan|library_alex|renaissance|silkroad|telegraph|steamtrain/, Landmark],
  [/castle|tsarpalace|samurai|vikingship|pirateship/, Castle],
  [/church|cathedralbuild|monaster|ritualsite/, Church],
  [/scroll|scriptorium|writ/, Scroll],
  [/trench|expedition|archdig/, Compass],
  [/feather|quill/, Feather],
  [/axe|woodcut/, Axe],
  [/shovel|dig/, Shovel],

  [/morgue|funeralhome|cemetery|crypt/, Skull],
  [/asylum|sanatorium|nightclinic|hauntedhotel|abandonedhouse|lostvillage|circusnight|waxmuseum|darkmetro|ritual/, Radiation],
  [/hospital|schoolmed|anatomytheatre/, Ambulance],
  [/clinic|dentist/, Syringe],
  [/pharmacy/, Stethoscope],
  [/brain|psych/, Brain],

  /* ---------------------------------------------------------------- *
   * Broader categories.
   * ---------------------------------------------------------------- */
  [/pizz/, Pizza],
  [/coffee|teahouse|barista|coffeeroast/, Coffee],
  [/wine|winecellar|brewery/, Wine],
  [/cake|bakeoff|chocolatefactory|icecream|bakery/, Cake],
  [/noodle|soup|stolovaya|cafeteria|unicanteen|officecanteen/, Soup],
  [/fish/, Fish],
  [/bird|apiary/, Bird],
  [/wheat|cheesefarm|foodlab|cookingshow/, Wheat],
  [/restaurant|diner|michelin|streetfood|vegan|foodtruck|bbqyard|thanksgiving|sushibar/, Utensils],
  [/popcorn/, Popcorn],
  [/tractor|farm/, Tractor],

  [/plane|airport/, Plane],
  [/train|metro|poezd|cablecar|trainstation/, Train],
  [/bus|avtobus|schoolbus|busstation/, Bus],
  [/taxi|roadtrip|parking|gasstation|carwash|caravanpark/, Car],
  [/ship|lighthouse|harbour/, Ship],
  [/anchor|port/, Anchor],
  [/luggage|hotel/, Luggage],
  [/backpack|campsite|tent|pioneercamp|fieldpractice|schooltrip|safari/, Tent],
  [/binocular|birdwatch/, Binoculars],
  [/mailbox|postoffice|pochtasov/, Mailbox],
  [/map|nationalpark/, Map],

  [/forest|taiga|jungle|trees|sanctuary/, Trees],
  [/mountain|canyon|volcano|tundra|desert|savanna|cave|mountainpass|mountainhut/, Mountain],
  [/beach|coralreef|waterfall|swamp|marsh|fishingriver|surf|thermalspa|islandsmall/, Waves],
  [/zoo|vetclinic|ranch/, PawPrint],
  [/forestfire|firestation|flame/, Flame],
  [/siren|police|nypd|sheriff/, Siren],
  [/gavel|legal|court/, Gavel],
  [/vote|election|parad|subbotnik/, Vote],

  [/school|classroom|lecture|exam|session|olympiad|thesis|deanoffice|schoolyard|corridor|lockerroom|teachersroom|headmaster|unicourtyard/, GraduationCap],
  [/librar|bibliotek/, Library],
  [/book/, BookOpen],
  [/lab|chemlab|nii|unilab/, FlaskConical],
  [/microscope|birdstation/, Microscope],
  [/beaker|distill/, Beaker],
  [/telescope|observ/, Telescope],
  [/museum/, Landmark],
  [/music|musicroom/, Music],
  [/camera|photo|hollywood/, Camera],
  [/presentation|meetingroom/, Presentation],
  [/factory|construction/, Factory],
  [/hammer|workshop/, Hammer],
  [/wrench|laundromat/, Wrench],
  [/scissors|barbershop|tattoo/, Scissors],
  [/container|cargo/, Container],
  [/bank/, Banknote],
  [/dorm|kommunalka|kvartira|attic|basement|home|house/, Home],
  [/office|openspace|bosscabinet|reception|unistartup/, Briefcase],
  [/mall|supermarket|shop|store/, Store],
];

/** One on-theme icon per pack, used when no rule matches. */
const PACK_FALLBACK: Record<string, LucideIcon> = {
  general1: Store,
  general2: Building2,
  general3: Plane,
  school: GraduationCap,
  university: GraduationCap,
  office: Briefcase,
  horror: Skull,
  gaming: Gamepad2,
  ussr: Landmark,
  usa: Landmark,
  nature: Trees,
  history: Castle,
  scifi: Rocket,
  sports: Trophy,
  food: Utensils,
};

export function locationIcon(locationId: string, packId: string): LucideIcon {
  for (const [pattern, icon] of RULES) {
    if (pattern.test(locationId)) return icon;
  }
  return PACK_FALLBACK[packId] ?? Users;
}
