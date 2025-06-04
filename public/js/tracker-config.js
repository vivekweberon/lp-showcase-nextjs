// const MAUTIC_FORMSET = {
//   showcase: ["pfshowcase", "32"],
//   bayrentals: ["pfbayrentals", "33"],
//   bestbuys: ["pfbestbuys", "34"],
//   phtb: ["pfphtb", "42"],
//   guaranteedsale: ["pfguaranteedsale", "51"],
//   "1925fallbrook": ["pf1925fallbrook", "52"],
//   nlannaira3171: ["pfnlannaira3171", "103"],
//   rderemnalla7741_21Jun22_postcard: ["pfrderemnalla774121jun22postcard", "105"],
//   doowelra004_22aug22_postcard: ["pfdoowelra00422aug22postcard", "107"],
//   doowelra004_fb_pd: ["pfdoowelra004fbpd", "108"],
//   yawnavonod0212_fb_pd: ["pfyawnavonod0212fbpd", "109"],
//   yawnavonod0212_22aug22_postcard: ["pfyawnavonod021222aug22postcard", "110"],
//   yawnavonod0212: ["pfyawnavonod0212", "112"],
//   doowelra004: ["pfdoowelra004", "113"],
//   yawnavonod0212_scl_cl: ["pfyawnavonod0212sclcl", "114"],
//   yawnavonod0212_scl_fbm: ["pfyawnavonod0212sclfbm", "115"],
//   openhouse: ["pfopenhouse", "116"],
//   "b-12tpardekalhtron164": ["pfb12tpardekalhtron164", "139"],
//   "s-12tpardekalhtron164": ["pfs12tpardekalhtron164", "141"],
// };

let emailFormHeader = "Access this FREE report now:";
let phoneFormHeader = "Review Email. Best number to reach you?";
let popupForm = false;
let timeInterval = 3000;
let nTimes = 3;
let zDuration = 5000;

function setEmailFormHeader(formHeader) {
  if (formHeader) {
    emailFormHeader = formHeader;
  }
}

function setPhoneFormHeader(formHeader) {
  if (formHeader) {
    phoneFormHeader = formHeader;
  }
}
