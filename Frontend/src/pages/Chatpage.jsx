import React from 'react'
import Left from "../home/left/Left"
import Logout from "../home/left1/Logout"
import Right from "../home/right/Right"

function Chatpage() {
    return (
        <div>
            <div className="flex h-screen">
                <Logout />
                <Left />
                <Right />
              </div>

        </div>
    )
}

export default Chatpage
