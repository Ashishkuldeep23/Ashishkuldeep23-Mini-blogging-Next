'use client'
import { searchUserAndPost, setKeyText, useSearchData } from '@/redux/slices/SearchSlice';
import { useThemeData } from '@/redux/slices/ThemeSlice'
import { AppDispatch } from '@/redux/store';
import { useRouter } from 'next/navigation'
import { handleClientScriptLoad } from 'next/script';
import React, { useEffect, useRef, useState } from 'react'
import { MdOutlineArrowBackIosNew } from "react-icons/md";
import { useDispatch } from 'react-redux';
import SingleUserDiv from '../components/SingleUserDiv';
import { getUserData, setUserDataBySession, updateUserData, useUserState } from '@/redux/slices/UserSlice';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import SinglePostCard from '../components/SinglePostCard';
import { PlaceholdersAndVanishInput } from '../components/ui/placeholders-and-vanish-input';
import { setSearchByText, usePostData } from '@/redux/slices/PostSlice';




const SearchPage = () => {

    const dispatch = useDispatch<AppDispatch>()

    const themeMode = useThemeData().mode

    const router = useRouter()
    
    const searchByText = usePostData().searchByText

    const searchInputRef = useRef<HTMLInputElement>(null)

    const { data: session } = useSession()

    const { userData } = useUserState()

    const { keyText: searchText, isLoading, userSuggetionArr, postSuggetionArr } = useSearchData()

    const setSearchText = (text: string) => dispatch(setKeyText(text))

    const [isUserStopTyping, setIsUserStopTyping] = useState<boolean>(false)

    const [seeAllResult, setseeAllResult] = useState<boolean>(false)

    const [allPostOrUser, setAllPostOrUser] = useState<boolean>(false)

    const [searchHistory, setsearchHistory] = useState<string[]>([])


    // // // This type we can use in set timeout -->
    type Timer = ReturnType<typeof setTimeout>

    let timeOutValue: Timer;

    function onChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {

        setseeAllResult(false)

        setSearchText(e.target.value);

        clearTimeout(timeOutValue)

        timeOutValue = setTimeout(() => {
            setIsUserStopTyping(true)
            // console.log("osk")
        }, 700)
    }

    type EventOfClick = React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement, MouseEvent> | React.FormEvent<HTMLFormElement>

    function hardSearchHandler(e: EventOfClick) {

        // // // Make search empty now --------->
        dispatch(setSearchByText(""))


        // // // See all result ----->
        setseeAllResult(true)

        setsearchHistoryFunc(searchText)

        e.stopPropagation();

        if (isUserStopTyping) {
            if (!isLoading && searchText) {
                dispatch(searchUserAndPost({ type: 'hard', key: searchText.trim() }))
                setIsUserStopTyping(false)
            }
        }
    }



    function setsearchHistoryFunc(text: string) {
        // // // setsearchHistory set history ----->

        let setDataForHistory = new Set([text, ...searchHistory])
        setsearchHistory([...setDataForHistory])

        setIsUserStopTyping(true)
    }


    useEffect(() => {

        // // // Input focus --------->
        if (searchInputRef) {
            searchInputRef.current?.focus()
        }

        // // // Load history ---------->


    }, [])


    // // // Bwlow is user to search posts and users in OnChange Handler ------------>
    useEffect(() => {
        // // // This is used to call DB for suggestions ------->
        if (isUserStopTyping) {

            // // // Here checking two thing 
            // // 1s is) is loading is false (means not getting data)
            // // // 2nd is) text having someting 
            if (!isLoading && searchText) {
                // alert("Calling Dispatch here --->")
                // console.log("calling db")


                dispatch(searchUserAndPost({ type: "soft", key: searchText.trim() }))


                setIsUserStopTyping(false)
            }
        }


        // // // This is used to set false right side ----->
        if (searchText === "") {
            setseeAllResult(false)
        }

    }, [searchText, isUserStopTyping])


    // // // Get and set user data from server -------->
    useEffect(() => {

        if (session) {
            let user = session.user
            dispatch(setUserDataBySession({ ...user }))
        }

        // // // get user data by api (All Data) ----------->
        if (session && (!userData.friendsAllFriend || !userData.sendRequest || !userData.reciveRequest)) {
            dispatch(getUserData(session?.user._id))
        }

    }, [session])


    useEffect(() => {

        if (searchText && searchHistory.length > 0) {
            localStorage.setItem("searchHistory", JSON.stringify(searchHistory))
        }

        if (searchHistory.length === 0) {

            let getHistory = localStorage.getItem("searchHistory")

            if (getHistory) {

                getHistory = JSON.parse(getHistory)

                if (getHistory && getHistory?.length > 0) {
                    setsearchHistory([...getHistory])
                }

                // getHistory && setsearchHistory([...getHistory])

            }

        }


    }, [searchHistory])



    // Just set true false according to value got in search result ---------->

    useEffect(() => {

        if (userSuggetionArr.length > postSuggetionArr.length) {
            setAllPostOrUser(false)
        }
        else if (postSuggetionArr.length > userSuggetionArr.length) {
            setAllPostOrUser(true)
        }
        else {
            setAllPostOrUser(false)
        }

    }, [userSuggetionArr, postSuggetionArr])



    return (

        <div
            className={`
                     px-2 py-2 w-full min-h-[100vh] 
                    ${!themeMode ? "bg-black text-white" : "text-black bg-white"}    
                `}
        >

            <div className=' flex flex-col justify-center items-center gap-1  mt-2 relative'>

                <div className=' w-full flex justify-center items-center gap-1 ' >

                    <button
                        className={` -mt-2 border rounded-full  py-1 p-0.5 font-bold shadow-lg capitalize
                                         ${!themeMode ? "text-white/50 bg-black shadow-slate-700 border-slate-700 " : "text-black/50 bg-white shadow-slate-300 border-slate-300 "}
                                         `}
                        onClick={() => router.back()}
                    >
                        <MdOutlineArrowBackIosNew />

                    </button>

                    {/* Previously i'm using this input ---------> */}
                    {/* <input
                        name="Search Input"
                        type="text"
                        className={`p-0.5 px-2 font-bold w-11/12 sm:w-4/6 rounded-full shadow-lg  border 
                                          ${!themeMode ? "text-white bg-black shadow-slate-700 border-slate-700 " : "text-black bg-white shadow-slate-300 border-slate-300 "}
                                        `}
                        placeholder="Search here."
                        ref={searchInputRef}
                        value={searchText}
                        onChange={(e) => (onChangeHandler(e))}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                hardSearchHandler(e)
                            }
                        }}
                    /> */}

                    <PlaceholdersAndVanishInput
                        onChange={(e) => (onChangeHandler(e))}
                        onSubmit={(e) => { hardSearchHandler(e) }}
                        placeholders={['Search by post title, category and hashtag', 'Search by user name.', 'Search here...', 'Made by Ashish kuldeep.']}
                        inputValue={searchByText}

                    />


                </div>

                <div className=' w-11/12 sm:w-4/6 mt-1'>
                    <p
                        className={`text-xs text-opacity-50 text-start ml-5
                                         ${!themeMode ? "text-white/50 " : "text-black/50 "}
                                         `}
                    >
                        <span>Search for </span>
                        <span className={`font-semibold ${!themeMode ? "text-white/70 " : "text-black/70 "}`}>Accounts</span>
                        <span> (by name or email) or </span>
                        <span className={`font-semibold ${!themeMode ? "text-white/70 " : "text-black/70 "}`} >Posts</span>
                        <span> (by category , hashtags or title) above ☝️</span>
                    </p>
                </div>


                {/* Sugetion div started here ------> */}

                {

                    // !seeAllResult

                    //     ?

                    <div
                        className=' relative w-[99.8%] sm:w-[68.5%] bg-red-600'

                    >
                        {/* Both handled by css depends upon value ------> */}


                        {/* Suggetion left ------------> */}
                        <div
                            className={`
                                        px-2 py-1 rounded w-full h-full absolute transition-all duration-200
                                        ${!themeMode ? "bg-black text-white" : "text-black bg-white"}   
                                        ${!seeAllResult ? " scale-100 visible right-0" : " scale-0 invisible right-[100%}"}
                                    `}
                        >

                            {
                                !searchText
                                    ?
                                    <>

                                        {
                                            searchHistory.map((ele, i) => {
                                                return <p
                                                    key={i}
                                                    className={` relative bg-rose-950 rounded my-1 pl-1 hover:cursor-pointer`}
                                                    onClick={() => {
                                                        setSearchText(`${ele}`)
                                                        setsearchHistoryFunc(ele)
                                                    }}
                                                >
                                                    {ele}

                                                    <span
                                                        className=' border px-1  border-red-500 rounded absolute right-3 text-xs my-0.5 text-red-500'

                                                        onClick={(e) => {
                                                            e.stopPropagation()


                                                            // // 1st way ----->
                                                            // let newHistoryArr = searchHistory.filter((item, index) => i != index)
                                                            // // console.log(newHistoryArr)
                                                            // setsearchHistory([...newHistoryArr])


                                                            // // 2nd way ------>
                                                            searchHistory.splice(i, 1)
                                                            setsearchHistory([...searchHistory])

                                                            // // Update now
                                                            localStorage.setItem("searchHistory", JSON.stringify(searchHistory))

                                                        }}

                                                    >X</span>
                                                </p>
                                            })
                                        }

                                    </>

                                    :
                                    <SuggetionForUsers />
                            }


                            {
                                userSuggetionArr.length !== 0 && postSuggetionArr.length !== 0
                                &&
                                <button
                                    className='w-full mt-5 text-sm text-blue-500 text-center sm:text-start ml-0 sm:ml-40'
                                    onClick={(e) => { hardSearchHandler(e) }}
                                >See all results</button>
                            }



                        </div>


                        {/* Suggetion right ------------> */}
                        <div
                            className={` h-[85vh] w-full overflow-x-auto overflow-y-visible  px-2 py-1 rounded  absolute transition-all duration-200 
                                    ${!themeMode ? "bg-black text-white" : "text-black bg-white"} 
                                    ${!seeAllResult ? " scale-0 invisible right-[100%]" : " scale-100 visible right-0 "}
                                `}
                        >


                            {

                                userSuggetionArr.length === 0 && postSuggetionArr.length === 0

                                    ?
                                    <div>
                                        <p className=' my-1 text-sm ml-5 text-red-500'>
                                            No <span className=' font-semibold'>user and post</span> found with <span className=' font-semibold'>{searchText}</span> : 404
                                        </p>
                                    </div>

                                    :
                                    <div className=' flex gap-1 items-center my-2'>
                                        <div
                                            className={`w-1/2 text-center border-blue-600 hover:cursor-pointer ${!allPostOrUser && " text-blue-600 font-semibold border-b-2"}`}
                                            onClick={() => setAllPostOrUser(false)}
                                        >
                                            All Users
                                        </div>
                                        <div
                                            className={`w-1/2 text-center  border-red-600 hover:cursor-pointer ${allPostOrUser && " text-red-600 font-semibold border-b-2"}`}
                                            onClick={() => setAllPostOrUser(true)}
                                        >
                                            All Posts
                                        </div>
                                    </div>



                            }




                            {

                                (userSuggetionArr.length !== 0 || postSuggetionArr.length !== 0)

                                &&
                                <>

                                    {

                                        !allPostOrUser
                                            ?
                                            <div>
                                                <SuggetionForUsers />
                                            </div>
                                            :
                                            <div>
                                                <SuggetionForPost />
                                            </div>
                                    }

                                </>

                            }


                        </div>

                    </div>


                }


            </div>

        </div>

    )
}

export default SearchPage


function SuggetionForUsers() {


    const { userSuggetionArr: users } = useSearchData()

    const { keyText, isLoading } = useSearchData()

    const { userData } = useUserState()

    const { data: session } = useSession()

    const dispatch = useDispatch<AppDispatch>()



    function addFriend(id: string) {

        if (!session?.user._id) return toast.error("You are looking logged out, please login.")

        // if (!searchedUser?._id) return toast.error("Refresh the page again please.")

        dispatch(updateUserData(
            {
                whatUpdate: 'sendFriendRequest',
                sender: session.user._id,
                reciver: id
            }
        ))

    }



    return (
        <div
            className=' relative'
        >

            {

                users.length === 0 && !isLoading
                    ?
                    <p className=' my-1 text-sm ml-5 text-red-500'>
                        No user found with <span className=' font-semibold'>{keyText}</span> : 404
                    </p>
                    :

                    users.map((user, i) => <SingleUserDiv
                        i={i}
                        key={user._id}
                        friend={user}
                        userData={userData}
                        addFriend={addFriend}
                    />)


            }


        </div>
    )

}


function SuggetionForPost() {


    const { postSuggetionArr: posts, keyText, isLoading } = useSearchData()


    return (
        <>

            {
                posts.length === 0 && !isLoading
                    ?
                    <p className=' my-1 text-sm ml-5 text-red-500'>
                        No user found with <span className=' font-semibold'>{keyText}</span> : 404
                    </p>
                    :

                    <div className="card_container mt-10 relative sm:px-[8vh] flex gap-10 gap-x-20 p-0.5 flex-wrap justify-center items-start ">
                        {
                            posts.map((ele, i) => {
                                return (
                                    <SinglePostCard key={i} ele={ele} className=' scale-[0.85] sm:scale-[0.7] hover:z-10' />
                                )
                            })
                        }
                    </div>



            }

        </>
    )

}


