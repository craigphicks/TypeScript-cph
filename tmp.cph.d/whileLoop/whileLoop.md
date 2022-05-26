

```

```

`t` and `obj.bug` are correctly typed, but `obj` is "possibly unedfined".


That's because both a determined by sperate calls to "checkExpressionWorker",
but in the case of the call for "obj", the search back through the flow nodes doesn't go further than the loop label,
but in the case of the "obj.bug", is does go back up futher, up past the loop label.

If we set all identifiers with their corresponding symbols, that would be helpful,
That could be done when `isAssigned` is set.