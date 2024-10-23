chrome.runtime.onInstalled.addListener(() => {
  const MAX_RULES = 5000; 

  fetch("https://easylist.to/easylist/easylist.txt")
    .then((response) => response.text())
    .then((text) => {
      const rules = parseEasyList(text);
      const limitedRules = rules.slice(0, MAX_RULES);

      chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
        const existingRuleIds = existingRules.map((rule) => rule.id);
        chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: existingRuleIds, 
          addRules: limitedRules,
        });
      });
    });
});


function parseEasyList(easyListText) {
  const rules = [];
  const lines = easyListText.split("\n");
  let ruleId = 1;

  lines.forEach((line) => {
    if (line.startsWith("||") && line.includes("^") && !line.includes("*")) {
      const domain = line.slice(2).split("^")[0];
      if (domain.length > 0) {
        rules.push({
          id: ruleId,
          priority: 1,
          action: { type: "block" },
          condition: {
            urlFilter: domain,
            resourceTypes: [
              "script",
              "image",
              "sub_frame",
              "media",
              "xmlhttprequest",
            ],
          },
        });
        ruleId++;
      }
    }
  });
  console.log(rules);
  return rules;
}
