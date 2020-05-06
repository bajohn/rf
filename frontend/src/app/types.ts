export interface iWsMsg {
    action: endpoint
    message: {
        gameId: string
        [key: string]: string | number
    }
}

export interface iCardData {
    [key: string]: any
    x?: number
    y?: number
    z?: number
    cardValue?: string
    groupID?: number
    faceUp?: boolean
    ownerID?: string
}



export type endpoint =
    'initialize' |
    'send-message' |
    'clear-connections' |
    'card-move-start' |
    'card-move-end' |
    'card-shuffle' |
    'test' |
    'create-room'
export interface position { x: number, y: number };

