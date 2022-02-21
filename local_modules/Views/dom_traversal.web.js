'use strict'

function DoesAnyParentOfElementMatch__sync (
  possibleChildElement,
  match_fn // (anAncestorNode) -> Bool
) { // This function is to remain synchronous as named
  let anAncestorNode = possibleChildElement.parentNode
  while (anAncestorNode != null && typeof anAncestorNode !== 'undefined') {
    if (match_fn(anAncestorNode) === true) {
      return true // also exits
    }
    anAncestorNode = anAncestorNode.parentNode
  }
  return false
}
exports.DoesAnyParentOfElementMatch__sync = DoesAnyParentOfElementMatch__sync
