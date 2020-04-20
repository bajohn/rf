export interface iWsMsg {
    action: endpoint
    message: {
        game_id: string
        [key: string]: string | number
    }
}

export type endpoint = 'initialize' | 
'send-message' | 
'clear-connections' | 
'card-move-start' |
 'card-move-end' |
 'test';
export interface position { x: number, y: number };