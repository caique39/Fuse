import ExactMatch from './exact-match'
import InverseExactMatch from './inverse-exact-match'
import PrefixExactMatch from './prefix-exact-match'
import InversePrefixExactMatch from './inverse-prefix-exact-match'
import SuffixExactMatch from './suffix-exact-match'
import InverseSuffixExactMatch from './inverse-suffix-exact-match'
import FuzzyMatch from './fuzzy-match'

// ❗Order is important. DO NOT CHANGE.
const searchers = [
  ExactMatch,
  PrefixExactMatch,
  InversePrefixExactMatch,
  InverseSuffixExactMatch,
  SuffixExactMatch,
  InverseExactMatch,
  FuzzyMatch
]
const searchersLen = searchers.length

// Regex to split by spaces, but keep anything in quotes together
const SPACE_RE = / +(?=([^\"]*\"[^\"]*\")*[^\"]*$)/
const OR_TOKEN = '|'

// Return a 2D array representation of the query, for simpler parsing.
// Example:
// "^core go$ | rb$ | py$ xy$" => [["^core", "go$"], ["rb$"], ["py$", "xy$"]]
export default function parseQuery(pattern, options) {
  return pattern.split(OR_TOKEN).map((item) => {
    let query = item
      .trim()
      .split(SPACE_RE)
      .filter((item) => item && !!item.trim())

    let results = []
    for (let i = 0, len = query.length; i < len; i += 1) {
      const queryItem = query[i]

      // 1. Handle literal queries (i.e, once that are quotes "hello world")
      let found = false
      let idx = -1
      while (!found && ++idx < searchersLen) {
        const searcher = searchers[idx]
        let token = searcher.isLiteralMatch(queryItem)
        if (token) {
          results.push(new searcher(token, options))
          found = true
        }
      }

      if (found) {
        continue
      }

      // 2. Handle regular queries
      idx = -1
      while (++idx < searchersLen) {
        const searcher = searchers[idx]
        let token = searcher.isRegMatch(queryItem)
        if (token) {
          results.push(new searcher(token, options))
          break
        }
      }
    }

    return results
  })
}
