export interface iWsMsg {
    action: endpoint
    message: {
        gameId: string
        [key: string]: any
    }
}

export interface iCardData {
    [key: string]: any
    x?: number
    y?: number
    z?: number
    cardValue?: string
    groupId?: string
    faceUp?: boolean
    ownerId?: string
}



export type endpoint =
    'initialize' |
    'initialize-cards' |
    'initialize-connection-id' |
    'send-message' |
    'clear-connections' |
    'card-move-start' |
    'card-move-end-bulk' |
    'group-move-end' |
    'recall-and-shuffle' |
    'test' |
    'create-room' | 
    'get-player' |
    'update-player'
export interface position { x: number, y: number };

