$(".like-btn").on("click", (event)=>{
	let $this = $(event.currentTarget);
	let postId = $this.attr("id");
    $.ajax({
        type:"POST",
        url:`https://kentsel-dictionary-stoyi.c9users.io/entries/${postId}/like/?_method=PUT`,
        data:{action:"like"},
        success: (data)=>{
            getLikesAndUpdate(postId, data, true);
        },error:()=>{
            console.log("error");
        }
    });
});

$(".dislike-btn").on("click", (event)=>{
	let $this = $(event.currentTarget);
	let postId = $this.attr("id");
    $.ajax({
        type:"POST",
        url:`https://kentsel-dictionary-stoyi.c9users.io/entries/${postId}/like/?_method=PUT`,
        data:{action:"dislike"},
        success: (data)=>{
            getLikesAndUpdate(postId, data, false);
        },error:()=>{
            console.log("error");
        }
    });
});

function getLikesAndUpdate(id, entry, type){
    if(entry.from !== "middle"){
        type?entry.likes++:entry.likes--;
    }
    $(`#${id}`).html(`<i class="far fa-thumbs-up">${entry.likes}</i>`);
}

$(".big-btn").on("click", ()=>{
	$(".form-all").toggle();
	$(".big-btn").toggle();
})
