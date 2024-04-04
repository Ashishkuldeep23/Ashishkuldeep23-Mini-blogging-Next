'use client'

import { PostInterFace, setAllPosts, setErrMsg, setIsLoading, setSinglePostId, usePostData } from "@/redux/slices/PostSlice"
import { AppDispatch } from "@/redux/store"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import MainLoader from "./MainLoader"
import { useThemeData } from "@/redux/slices/ThemeSlice"
import { useRouter } from "next/navigation"
import LikeCommentDiv from "./LikeCommentDiv"
import ImageReact from "./ImageReact"

function AllPostDiv() {

    const allPostData = usePostData().allPost
    const isLoading = usePostData().isLoading

    const dispatch = useDispatch<AppDispatch>()


    async function fetchAllPosts() {

        dispatch(setIsLoading(true))

        dispatch(setErrMsg(""))

        const option: RequestInit = {
            method: "POST",
            cache: 'no-store',
            next: {
                revalidate: 3
            },
        }

        const response = await fetch(`/api/post/all?timestamp=${Date.now()}`, option)
        let json = await response.json();

        // console.log(json)

        if (json.success) {
            dispatch(setAllPosts(json.data))
        } else {
            dispatch(setErrMsg(json.message))
        }

        dispatch(setIsLoading(false))
    }


    useEffect(() => {
        if (allPostData.length <= 1) {

            fetchAllPosts()

            // dispatch(getAllPosts())
        }
    }, [])

    return (

        <div className="card_container relative sm:px-[8vh] mt-16 flex gap-10 p-0.5 flex-wrap justify-center items-start ">

            <MainLoader isLoading={isLoading} />

            {

                allPostData.length > 0
                    ?

                    allPostData.map((ele, i) => {
                        return (
                            <Card key={i} ele={ele} />
                        )
                    })

                    : <></>

                // : [null, null, null, null, null, null, null, null, null, null].map((ele, i) => {
                //   return (

                //     <Card key={i} ele={ele} />

                //   )
                // })
            }

        </div>
    )
}

export default AllPostDiv


function Card({ ele }: { ele: PostInterFace }) {

    const themeMode = useThemeData().mode

    const dispatch = useDispatch()

    const router = useRouter()

    const promptText = ele.promptReturn

    const charactersWant = 90


    function cardClickHadler(postId: string) {

        // console.log(postId)

        dispatch(setSinglePostId(postId))

        router.push(`/post/${postId}`)
    }


    return (
        <div
            onClick={(e) => { e.stopPropagation(); cardClickHadler(ele._id) }}

            style={{ padding: "3px" }}
            className="single_Card bg-gradient-to-tr from-cyan-400  w-72 sm:w-80  sm:p-2 rounded hover:cursor-pointer hover:scale-105 sm:hover:scale-110 transition-all"
        >

            <div className={` p-1 ${!themeMode ? " bg-black text-white " : " bg-white text-black"}`}>

                <div className="rounded-t flex p-0.5 gap-1.5 items-center border-b border-cyan-400">

                    <ImageReact
                        className=" rounded-full w-8"
                        src={`${ele?.author?.profilePic || "https://res.cloudinary.com/dlvq8n2ca/image/upload/v1701708322/jual47jntd2lpkgx8mfx.png"}`}
                        alt=""
                    />

                    <div className=" mt-1">
                        <p className=" leading-[0.7rem] capitalize">{ele?.author?.username || "Name Kumar"}</p>
                        <p className=" text-[0.6rem]">{ele?.author?.email || "xyz100@gmail.com"}</p>
                    </div>

                    {
                        ele?.author?.isVerified
                        &&
                        <span className="mr-2 text-sm ">✅</span>
                    }
                </div>

                <div className=" flex justify-between flex-wrap gap-1">
                    <p className="capitalize">{ele.title}</p>
                    <p className=" ml-auto text-xs">:- {ele.category}</p>
                </div>

                <div className=" text-sm"

                // style={{ overflow : "hidden" , textOverflow : "ellipsis", whiteSpace : "balance"}}
                >

                    {
                        promptText.toString().length > charactersWant ? `${promptText.slice(0, charactersWant)}...` : `${promptText}`

                        // promptText
                    }

                </div>

                <div className=" flex flex-wrap gap-0.[2px] text-violet-500 font-semibold ">
                    {

                        ele.hashthats.length > 0

                            ?

                            ele.hashthats.map((hash, i) => {
                                return <p className="ml-1.5" key={i}>{hash}</p>
                            })

                            : <>
                                <p>#promp</p>
                                <p>#ai</p>
                                <p>#write</p>
                            </>
                    }
                </div>

                {/* <div className=" flex gap-5 text-xs mt-2">
            <p>{ele.likes} Likes</p>
            <p>{ele.comments.length} Comments</p>
          </div> */}

                <LikeCommentDiv post={ele} />

            </div>

        </div>
    )
}