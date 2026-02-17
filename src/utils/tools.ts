
export const getLastSixMonthsRanges = (date: Date) => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 6; i++) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        dates.push(date);
    }
    return dates;
};

export const roundToNearest4 = (num: number) => {
    return Math.round(num / 4) * 4;
};
