#!/bin/bash

# Vocabulary Counter Script
# Counts words per language and level in vocabulary.json

if [ ! -f "vocabulary.json" ]; then
    echo "❌ vocabulary.json not found!"
    exit 1
fi

echo "📊 Vocabulary Statistics"
echo "========================"

# Function to count words for a specific language and level
count_words() {
    local language=$1
    local level=$2
    local count=$(jq -r ".languages.${language}.${level} | if type == \"object\" then [.[]] | add | length else length end" vocabulary.json 2>/dev/null)
    echo "  $level: $count words"
}

# Count for each language
for language in "German" "Spanish"; do
    echo
    if [ "$language" = "German" ]; then
        echo "🇩🇪 $language:"
    else
        echo "🇪🇸 $language:"
    fi
    
    total=0
    for level in "A1" "A2" "B1" "B2" "C1"; do
        count=$(jq -r ".languages.${language}.${level} | if type == \"object\" then [.[]] | add | length else length end" vocabulary.json 2>/dev/null)
        if [ "$count" != "null" ] && [ "$count" != "0" ]; then
            echo "  $level: $count words"
            total=$((total + count))
        else
            echo "  $level: 0 words"
        fi
    done
    echo "  📈 Total: $total words"
done

echo
echo "🎯 Target Requirements:"
echo "  A1: 500 words"
echo "  A2: 1,000 words" 
echo "  B1: 2,000 words"
echo "  B2: 4,000 words"
echo "  C1: 8,000 words"
echo "  📊 Total per language: 15,500 words"
