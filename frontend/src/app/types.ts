export interface iWsMsg {
    action: endpoint
    message: {
        gameId: string
        [key: string]: any
    }
}

export interface iCardData {
    cardValue?: string 
    x?: number
    y?: number
    z?: number
    groupId?: string
    faceUp?: boolean
    ownerId?: string
    date?: string
}

export interface iLclCardData {
    //[key: string]: any
    cardValue?: string
    cardBeingDragged?: boolean
}

export interface iGroupData {
    groupId?: string
    x?: number
    y?: number
    date?: string
}

export interface iLclGroupData {
    groupId?: string
    highlight?: boolean
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

