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
    date?: string
}

export interface iLclCardData {
    //[key: string]: any
    cardBeingDragged?: boolean
    cardValue?: string
}

export interface iGroupData {
    [key: string]: any
    x?: number
    y?: number
    groupId?: string
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
    'update-player' | 
    'heartbeat'
export interface position { x: number, y: number };

