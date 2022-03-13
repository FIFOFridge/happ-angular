export const isError = (test: any) => {
    if(test && test.stack && test.message)
        return true
    
    return false
}