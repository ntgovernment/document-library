$(document).ready(function () {
    // Hide the ntgc-status--toolbar initially
    $('#ntgc-status--toolbar').css('right', '-200px');

    // When the ntgc-status--toolbar tab is clicked, show or hide the ntgc-status--toolbar
    $('#ntgc-status--toolbar-tab').click(function () {
        if ($('#ntgc-status--toolbar').css('right') == '-200px') {
            // Show the ntgc-status--toolbar
            $('#ntgc-status--toolbar').animate({ right: '0px' }, 200);
        } else {
            // Hide the ntgc-status--toolbar
            $('#ntgc-status--toolbar').animate({ right: '-200px' }, 200);
        }
    });

    // When the user clicks off the ntgc-status--toolbar, hide it
    $(document).click(function (event) {
        if (!$(event.target).closest('.ntgc-status--toolbar-container').length) {
            // Hide the ntgc-status--toolbar
            $('#ntgc-status--toolbar').animate({ right: '-200px' }, 200);
        }
    });

    // Handle clicks on ntgc-status--toolbar items
    $('.ntgc-status--toolbar ul li a').click(function (e) {
        e.preventDefault();

        var href = $(this).attr('href');

        // Check the href to determine which action to take
        if (href == '#nocache') {
            window.location.href = '/_nocache';
        } else if (href == '#recache') {
            window.location.href = '/_recache';
        } else if (href == '#admin') {
            window.location.href = '/_admin';
        } else if (href == '#new-window') {
            window.open(window.location.href, '_blank');
        }

        // Hide the ntgc-status--toolbar
        $('#ntgc-status--toolbar').animate({ right: '-200px' }, 200);
    });

    // Reload the page with /_nocache at the end of the URL
    $(".ntgc-status--toolbar-nocache a").click(function (e) {
        e.preventDefault();
        var newUrl = window.location.href.replace(/(_nocache|_recache|_admin)$/, '') + "/_nocache";
        window.history.pushState({ path: newUrl }, '', newUrl + window.location.hash + window.location.search);
        location.reload();
    });

    // Reload the page with /_recache at the end of the URL
    $(".ntgc-status--toolbar-recache a").click(function (e) {
        e.preventDefault();
        var newUrl = window.location.href.replace(/(_nocache|_recache|_admin)$/, '') + "/_recache";
        window.history.pushState({ path: newUrl }, '', newUrl + window.location.hash + window.location.search);
        location.reload();
    });

    // Open the current page in a new tab/window
    $(".ntgc-status--toolbar-newWindow a").click(function (e) {
        e.preventDefault();
        window.open(window.location.href);
    });

    // Reload the page with /_admin at the end of the URL
    $(".ntgc-status--toolbar-admin a").click(function (e) {
        e.preventDefault();
        var newUrl = window.location.href.replace(/(_nocache|_recache|_admin)$/, '') + "/_admin";
        window.history.pushState({ path: newUrl }, '', newUrl + window.location.hash + window.location.search);
        location.reload();
    });

    const pageStat = document.getElementById("page-status");

    if (pageStat) {
        let permissions = pageStat.getAttribute("data-permissions"); // Get the value of data-permissions attribute
        let permissionsArray = JSON.parse(permissions);
        // Add 214487 preview accounts manually for user testing and logout purposes
        if (!permissionsArray.includes(214487)) {
          permissionsArray.push(214487);
        }
        permissions = JSON.stringify(permissionsArray);
        
        if (permissions.includes("213140") || permissions.includes("254573") || permissions.includes("198008")) {
            // Check if it contains any of the specified values

            $("#ntgc-status--toolbar-wrapper").show();
            $('.ntgc-status--toolbar-container').show();

            const assetId = pageStat.getAttribute("data-asset"); // Get the value of data-asset attribute

            // Update the Asset ID in the toolbar
            $('.ntgc-status--toolbar-id a').text(`Asset ID: ${assetId}`);

            // Add click event to copy asset ID
            $('.ntgc-status--toolbar-id a').click(function (e) {
                e.preventDefault();

                // Copy asset ID to clipboard
                navigator.clipboard.writeText(assetId).then(() => {
                    // Create and show custom tooltip
                    const tooltip = $('<div class="custom-tooltip">Asset ID copied</div>');
                    $('body').append(tooltip);

                    // Position the tooltip above the element
                    const offset = $(this).offset();
                    tooltip.css({
                        top: offset.top - $(this).height() - 10,
                        left: offset.left + 2,
                        position: 'absolute',
                        backgroundColor: '#333',
                        color: '#fff',
                        padding: '5px 10px',
                        borderRadius: '5px',
                        fontSize: '12px',
                        zIndex: 1000,
                        fontFamily: '"Roboto", arial, sans-serif'
                    }).fadeIn(200).delay(800).fadeOut(200, function() {
                        tooltip.remove();
                    });
                }).catch(err => {
                    console.error('Failed to copy asset ID: ', err);
                });
            });

            if (pageStat.dataset.status === "64") {
                document.getElementById("ntgc-status--toolbar-tab").classList.add("ntgc-status--toolbar-tab--safe"); // Set the background color of ntgc-status--toolbar tab
                document.querySelector("#ntgc-status--toolbar-tab").innerHTML = "Safe Editing <span class='ntgc-status--toolbar-icon-toggle fas fa-chevron-down float--right'></span>"; // Change the content of the <p> element inside ntgc-status--toolbar tab and add Font Awesome icon

                // Add class to ntgc-status--toolbar-id
                document.querySelector(".ntgc-status--toolbar-id").classList.add("ntgc-status--toolbar-tab--safe");

            } else if (pageStat.dataset.status === "1") {
                document.getElementById("ntgc-status--toolbar-tab").classList.add("ntgc-status--toolbar-tab--archive"); // Set the background color of ntgc-status--toolbar tab
                document.querySelector("#ntgc-status--toolbar-tab").innerHTML = "Archived <span class='ntgc-status--toolbar-icon-toggle fas fa-chevron-down float--right'></span>"; // Change the content of the <p> element inside ntgc-status--toolbar tab and add Font Awesome icon

                // Add class to ntgc-status--toolbar-id
                document.querySelector(".ntgc-status--toolbar-id").classList.add("ntgc-status--toolbar-tab--archive");

            } else if (pageStat.dataset.status === "2") {
                document.getElementById("ntgc-status--toolbar-tab").classList.add("ntgc-status--toolbar-tab--construction"); // Set the background color of ntgc-status--toolbar tab
                document.querySelector("#ntgc-status--toolbar-tab").innerHTML = "Under Construction <span class='ntgc-status--toolbar-icon-toggle fas fa-chevron-down float--right'></span>"; // Change the content of the <p> element inside ntgc-status--toolbar tab and add Font Awesome icon

                // Add class to ntgc-status--toolbar-id
                document.querySelector(".ntgc-status--toolbar-id").classList.add("ntgc-status--toolbar-tab--construction");

            } else if (pageStat.dataset.status === "16") {
                document.getElementById("ntgc-status--toolbar-tab").classList.add("ntgc-status--toolbar-tab--live"); // Set the background color of ntgc-status--toolbar tab
                document.querySelector("#ntgc-status--toolbar-tab").innerHTML = "Live <span class='ntgc-status--toolbar-icon-toggle fas fa-chevron-down float--right'></span>"; // Change the content of the <p> element inside ntgc-status--toolbar tab and add Font Awesome icon

                // Add class to ntgc-status--toolbar-id
                document.querySelector(".ntgc-status--toolbar-id").classList.add("ntgc-status--toolbar-tab--live");
            }
        }
        
        else if (permissions.includes("214487")) {
            $("#ntgc-status--toolbar-wrapper").show();
            $('.ntgc-status--toolbar-container').show();
            $('.ntgc-status--toolbar-tab').css('margin-top', '-153px');
            $('.ntgc-link-to-feedback').hide();
            $('.ntgc-status--toolbar-items').find('.ntgc-status--toolbar-id, .ntgc-status--toolbar-nocache, .ntgc-status--toolbar-recache, .ntgc-status--toolbar-newWindow, .ntgc-status--toolbar-admin').hide();
            
            const assetId = pageStat.getAttribute("data-asset"); // Get the value of data-asset attribute
            
            // Update the Asset ID in the toolbar
            $('.ntgc-status--toolbar-id a').text(`Asset ID: ${assetId}`);
            
            
            document.getElementById("ntgc-status--toolbar-tab").classList.add("ntgc-status--toolbar-tab--default");
            document.querySelector("#ntgc-status--toolbar-tab").innerHTML = `Logged in as <strong>${currentUser}</strong> <span class='ntgc-status--toolbar-icon-toggle fas fa-chevron-down float--right'></span>`; 

        }
    }
});

$(window).on('resize', function () {
    if ($(window).width() < 992) { // 992px is the width of Bootstrap's "medium" breakpoint
        $('.ntgc-status--toolbar-container').hide();
    } else {
        $('.ntgc-status--toolbar-container').show();
    }
});
