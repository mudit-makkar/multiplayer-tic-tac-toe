export const findGameWinner = (rounds) => {
    let count_X = 0, count_O = 0;
    for (let i = 0; i < rounds.length; i++) {
        if (rounds[i] == "X")
            count_X = count_X + 1;
        else if (rounds[i] == "O")
            count_O = count_O + 1;
    }
    if (count_X > count_O)
        return "X";
    else if (count_O > count_X)
        return "O";
    else
        return "None"
}
