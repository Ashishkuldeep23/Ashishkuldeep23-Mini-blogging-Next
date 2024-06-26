

import React from 'react'

const MaskerText = ({ text = "Effect", className = "" }: { text: string, className?: string }) => {
  return (

    <>

      <div
        style={{ lineBreak: "anywhere" }}

        className=' flex flex-wrap justify-center'
      >

        {
          text.trim().split("").map((ele, i) => {

            if (ele === " ") {
              return <span key={i} >&nbsp;</span>
            }

            return (
              <span className={`single_text ${className} `} key={i}>{ele.toString()}  </span>

            )
          })
        }

      </div>

    </>

  )
}

export default MaskerText

