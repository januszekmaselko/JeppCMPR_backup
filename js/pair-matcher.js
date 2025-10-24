// Pair matcher: Levenshtein + fuzzyMatch extracted from legacy, exported as ES functions
export function levenshteinDistance(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = [];

    for (let i = 0; i <= len1; i++) matrix[i] = [i];
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            if (str1.charAt(i - 1) === str2.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[len1][len2];
}

export function fuzzyMatch(oldFiles, newFiles) {
    const pairs = [];
    const unmatchedOld = [...oldFiles];
    const unmatchedNew = [...newFiles];

    // Exact name matches first
    for (let i = unmatchedOld.length - 1; i >= 0; i--) {
        for (let j = unmatchedNew.length - 1; j >= 0; j--) {
            if (unmatchedOld[i].name === unmatchedNew[j].name) {
                pairs.push({ oldFile: unmatchedOld[i], newFile: unmatchedNew[j], distance: 0 });
                unmatchedOld.splice(i, 1);
                unmatchedNew.splice(j, 1);
                break;
            }
        }
    }

    // Fuzzy matches
    for (const oldFile of unmatchedOld) {
        let bestMatch = null;
        let bestDistance = Infinity;

        for (const newFile of unmatchedNew) {
            const distance = levenshteinDistance(oldFile.name, newFile.name);
            const maxLen = Math.max(oldFile.name.length, newFile.name.length);
            const similarity = 1 - (distance / maxLen);

            if (similarity >= 0.7 && distance < bestDistance) {
                bestMatch = newFile;
                bestDistance = distance;
            }
        }

        if (bestMatch) {
            pairs.push({ oldFile, newFile: bestMatch, distance: bestDistance });
            const idx = unmatchedNew.indexOf(bestMatch);
            if (idx > -1) unmatchedNew.splice(idx, 1);
        }
    }

    const finalOld = unmatchedOld.filter(f => !pairs.some(p => p.oldFile === f));
    const finalNew = unmatchedNew.filter(f => !pairs.some(p => p.newFile === f));

    return { pairs, unpairedOld: finalOld, unpairedNew: finalNew };
}
