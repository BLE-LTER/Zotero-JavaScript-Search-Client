"use strict";

function makeAutocomplete(elementId, choices, minChars) {
   if (!minChars) minChars = 2;
   var autocomplete = new autoComplete({
      selector: "#" + elementId,
      minChars: minChars,
      source: function (term, suggest) {
         term = term.toLowerCase();
         var suggestions = [];
         for (var i = 0; i < choices.length; i++)
            if (~choices[i].toLowerCase().indexOf(term))
               suggestions.push(choices[i]);
         suggest(suggestions);
      }
   });
   return autocomplete;
}

makeAutocomplete("q", [
   "Brandon T. Bestelmeyer",
   "Stephanie Bestelmeyer",
   "Debra P. C. Peters",
   "Osvaldo E. Sala"
]);