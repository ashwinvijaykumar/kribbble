'use client'
import { useSelectedShotStore } from '@/hooks/show/use-selected-shot-Id'
import { Info, MessageCircle, Upload, X } from 'lucide-react'
import React from 'react'
import {motion, AnimatePresence} from "framer-motion"
import { useQuery } from '@tanstack/react-query'
import { getShotById } from '@/actions/shot'
import MainViewSkeleton from './MainViewSkeleton'
import Heading from './Heading'
import MainContent from './MainContent'
import Image from 'next/image'
import { getMoreShotByUser } from '@/actions/upload'
import Link from 'next/link'
import EachShot from '../EachShot'
import { useCommentStore } from '@/hooks/show/use-comment'
import Comments from './Comments'
import { getAllCommentByShot } from '@/actions/comment'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import { Button } from '@/components/ui/button'

type Props = {}

const MainView = (props: Props) => {
    const {isShotOpen, onCloseShot, selectedShotId} = useSelectedShotStore()
    const {isCommentOpen, onOpenComment, onCloseComment} = useCommentStore()

    // Fetch the shot data only if selectedShotId is available
    const {isLoading: shotLoading, data: shotData} = useQuery({
        queryKey: ['shot', selectedShotId],
        queryFn: async () => {
            if (selectedShotId) {
                const shot = await getShotById(selectedShotId)
                if (shot) {
                    return shot
                }
            }
            return null // Return null if shot doesn't exist
        },
        enabled: !!selectedShotId, // Only run the query if selectedShotId is not null
    })

    // Fetch more shots by the user only if shotData is available
    const {isLoading: moreShotLoading, data: moreShotData} = useQuery({
        queryKey: ['more-shot', shotData?.user?.id],
        queryFn: async () => {
            if (shotData?.user?.id && selectedShotId) {
                const moreShots = await getMoreShotByUser(shotData.user.id, shotData.id)
                return moreShots
            }
            return []
        },
        enabled: !!shotData?.user?.id, // Only run the query if the user ID is available
    })

    // Fetch comments only if shotData is available
    const {data: allCommentData} = useQuery({
        queryKey: ['number-comment', shotData?.id],
        queryFn: async () => {
            if (shotData?.id) {
                const comments = await getAllCommentByShot(shotData.id)
                return comments
            }
            return null
        },
        enabled: !!shotData?.id, // Only run the query if the shot ID is available
    })

    function backlink() {
        window.history.back()
    }

    return (
        <AnimatePresence>
            {isShotOpen && (
                <motion.div
                    initial={{ translateY: 1000, scale: 0.9, opacity: 0.7 }}
                    animate={{ opacity: 1, translateY: 0, scale: 1 }}
                    exit={{ opacity: 0, translateY: 1000 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className={`fixed max-md:top-0 max-md:left-0 bottom-0 max-md:right-0 md:h-[97vh] md:w-full md:rounded-t-[40px] bg-white z-[100] shadow-main-view overflow-y-auto`}>
                    
                    {/* Close button */}
                    <div onClick={() => { onCloseShot(); backlink() }} className='fixed top-0 right-4 cursor-pointer'>
                        <X className='text-white' size={24} />
                    </div>
                    
                    {/* Show loading state */}
                    {shotLoading ? (
                        <MainViewSkeleton />
                    ) : shotData ? (
                        <div>
                            <div className='flex items-start'>
                                <div className={`max-w-screen-lg w-3/4 transition-all duration-150 ease-in relative ${isCommentOpen ? "px-10 border-r-[1px]" : "mx-auto"}`}>
                                    <div>
                                        <div className='relative md:py-16 py-6'>
                                            <h1 className='text-2xl font-semibold'>{shotData?.title}</h1>
                                            <Heading shotData={shotData} />
                                            <MainContent shotData={shotData} />
                                            <div>
                                                <div className='flex items-center mt-14 mb-8'>
                                                    <div className='w-full h-[2px] bg-neutral-200' />
                                                    <span className='mx-5'>
                                                        {shotData?.user.image ? (
                                                            <div className='w-16 h-16'>
                                                                <Image src={shotData?.user.image} alt={shotData?.user.image} width={64} height={64} className='rounded-full' />
                                                            </div>
                                                        ) : (
                                                            <div className='w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center'>
                                                                <p className='uppercase text-4xl font-medium text-white'>{shotData?.user.name?.charAt(0)}</p>
                                                            </div>
                                                        )}
                                                    </span>
                                                    <div className='w-full h-[2px] bg-neutral-200' />
                                                </div>
                                                <div className='flex flex-col items-center'>
                                                    <h1 className='text-2xl font-medium text-black'>{shotData?.user.name}</h1>
                                                    <p className='text-sm py-3 mb-4'>Creating stars in the digital universe ✨ ⤵</p>
                                                    <button className='px-5 py-[10px] rounded-full bg-neutral-950 font-medium text-white text-sm'>Get in Touch</button>
                                                </div>
                                            </div>
                                            <div>
                                                <div className='flex items-center justify-between mt-20 mb-3'>
                                                    <h1 className='font-bold'>More by {shotData?.user.name}</h1>
                                                    <Link href='/profile'>View profile</Link>
                                                </div>
                                                <div className='grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5'>
                                                    {moreShotData && moreShotData.map((data, index) => (
                                                        <div key={index}>
                                                            <EachShot shot={data} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div onClick={onCloseComment} className={`p-2 border-[1px] border-neutral-200 rounded-full absolute top-12 -right-4 bg-white ${isCommentOpen ? "" : "hidden"}`}>
                                        <X size={14} />
                                    </div>
                                </div>
                                <Comments data={shotData} />
                            </div>
                            
                            {/* Comment, Upload, Info Buttons */}
                            <div className={`absolute top-1/2 space-y-5 right-5 ${isCommentOpen ? "hidden" : "block"}`}>
                                <button onClick={onOpenComment} className='p-2 border-[1.5px] border-neutral-200 rounded-full block relative'>
                                    <MessageCircle size={20} strokeWidth={2} className='text-neutral-800' />
                                    <div className='absolute -top-2 right-0 rounded-full w-4 h-4 text-xs bg-pink-600 text-white'>
                                        {allCommentData?.comments?.length || 0}
                                    </div>
                                </button>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button className='p-2 border-[1.5px] border-neutral-200 rounded-full block' variant="outline">
                                            <Upload size={20} strokeWidth={2} className='text-neutral-800' />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 z-[9999] overflow-x-scroll">
                                        <h1>{process.env.NEXT_PUBLIC_URL}shot/{shotData?.id}</h1>
                                    </PopoverContent>
                                </Popover>
                                <button className='p-2 border-[1.5px] border-neutral-200 rounded-full block'>
                                    <Info size={20} strokeWidth={2} className='text-neutral-800' />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>No shot data available</div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default MainView
