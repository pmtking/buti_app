// user 
export type User_Type = {
    name: string;
    profileimg?: string | any | File | Blob;
    // most update  on fix  app 
}

// storyBox_type
export type StoryBox_type = {
    data?: string | Blob | any;
    user?: User_Type;
    txt: string
}